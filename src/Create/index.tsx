import React, { useState, FormEvent, ChangeEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Container, Col, Collapse, Form, Button } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { firestore, auth } from 'firebase/app';
import { useAuthState } from 'react-firebase-hooks/auth';
import slugify from 'slugify';

import { H1, MainRow } from '../App.style';
import AddSwear from '../components/AddSwear';
import useClean from '../hooks/useClean';

type RBRef = string & ((ref: Element | null) => void);

export default function Create() {
  const history = useHistory();
  const [user] = useAuthState(auth());
  const censored = useClean();

  const { handleSubmit, register, errors } = useForm();
  const createIdea = handleSubmit(async ({ title, description, url }) => {
    try {
      const ideasCollection = firestore().collection('ideas');

      let slug = slugify(title).toLowerCase();
      let unique = false;
      let modifier = 0;
      do {
        let result = await ideasCollection
          .where('slug', '==', slug)
          .limit(1)
          .get();
        if (result.empty) {
          unique = true;
        } else {
          modifier++;
          slug = `${slug}-${modifier}`;
        }
      } while (!unique);

      const { id } = await ideasCollection.add({
        title,
        description,
        url,
        timestamp: new Date(),
        user: user.uid,
        slug,
        approved: false
      });
      history.push(`/${id}`);
    } catch ({ message }) {
      console.error(message);
    }
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState(false);

  const login = async () => {
    try {
      auth().signInWithEmailAndPassword(email, password);
    } catch ({ message }) {
      setError(message);
    }
  };

  const signUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      auth().createUserWithEmailAndPassword(email, password);
    } catch ({ message }) {
      setError(message);
    }
  };

  return (
    <Container>
      <Collapse in={!user}>
        <div>
          <MainRow>
            <Col>
              <H1>
                <AddSwear
                  sentence={'Sign into your account'}
                  swear={'fucking'}
                  censored={censored || !!user}
                />
              </H1>
              <Form onSubmit={signUp}>
                <Form.Group controlId="formBasicEmail">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setEmail(event.target.value)
                    }
                    type="email"
                    placeholder="Enter email"
                  />
                </Form.Group>
                <Form.Group controlId="formBasicPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setPassword(event.target.value)
                    }
                    type="password"
                    placeholder="Password"
                  />
                </Form.Group>
                <Form.Group controlId="formBasicCheckbox">
                  <Form.Label>
                    Agree to{' '}
                    <Link to="/terms-and-conditions">Terms and Conditions</Link>
                  </Form.Label>
                  {` `}
                  <Form.Check
                    checked={checked}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setChecked(event.target.checked)
                    }
                    type="checkbox"
                    inline
                  />
                </Form.Group>

                <Button
                  block
                  variant="primary"
                  type="submit"
                  disabled={!checked || !email || !password}
                >
                  Sign Up
                </Button>
                <Button block variant="link" onClick={login}>
                  Already Have An Account?
                </Button>
                <Form.Group controlId="formErrors">
                  <Form.Label>{error && <p>{error}</p>}</Form.Label>
                </Form.Group>
              </Form>
            </Col>
          </MainRow>
        </div>
      </Collapse>
      <Collapse in={!!user}>
        <div>
          <MainRow>
            <Col>
              <H1>
                <AddSwear
                  sentence={'Add your own idea'}
                  swear={'fucking'}
                  censored={censored || !user}
                />
              </H1>
              <Form onSubmit={createIdea}>
                <Form.Group controlId="createIdea">
                  <Form.Label>Idea</Form.Label>
                  <Form.Control
                    name="title"
                    placeholder="Enter Something..."
                    required
                    type="text"
                    ref={
                      register({
                        required: 'Required'
                      }) as RBRef
                    }
                  />
                  <Form.Text className="text-muted">
                    'Ride A Bike', 'Bake cakes' (No Swearing!)
                  </Form.Text>
                </Form.Group>
                <Form.Group controlId="createDescription">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    name="description"
                    placeholder="Explain it more..."
                    required
                    type="text"
                    ref={
                      register({
                        required: 'Required'
                      }) as RBRef
                    }
                  />
                </Form.Group>
                <Form.Group controlId="createUrl">
                  <Form.Label>Url (optional)</Form.Label>
                  <Form.Control
                    name="url"
                    placeholder="https://"
                    type="url"
                    ref={register() as RBRef}
                  />
                  <Form.Text className="text-muted">
                    Will open in a new tab
                  </Form.Text>
                </Form.Group>
                <Form.Group controlId="createErrors">
                  <Form.Control.Feedback type="invalid">
                    {JSON.stringify(errors)}
                  </Form.Control.Feedback>
                </Form.Group>
                <Button variant="primary" type="submit">
                  Submit
                </Button>
              </Form>
            </Col>
          </MainRow>
        </div>
      </Collapse>
    </Container>
  );
}