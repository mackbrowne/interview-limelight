// Framework
import React from 'react';

// Components
import { Container, Row, Col } from 'reactstrap';

import { BlueButton, RoundButton, RedButton } from './StyledButton.style';

/**
 * Homepage for the app!
 *
 * @param {Object} props All the properties passed to the React Component.
 * @returns {StatelessComponent} Stateless functional React component.
 */
const Home = props => (
  <Container fluid>
    <Row>
      <Col>
        <BlueButton>Simple Button</BlueButton>
      </Col>
    </Row>
    <Row>
      <Col>
        <RoundButton>Rounded Button</RoundButton>
      </Col>
    </Row>
    <Row>
      <Col>
        <RedButton>Red, Rounded Button</RedButton>
      </Col>
    </Row>
  </Container>
);

export default Home;
