/**
 * 404 Not Found page
 */
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 20px;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 50px;
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
`;

const ErrorCode = styled.h1`
  font-size: 8rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  line-height: 1;
`;

const Title = styled.h2`
  color: #333;
  font-size: 1.5rem;
  margin: 16px 0 12px;
`;

const Message = styled.p`
  color: #666;
  line-height: 1.6;
  margin-bottom: 32px;
`;

const Button = styled(Link)`
  display: inline-block;
  padding: 14px 32px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
    color: white;
  }
`;

const BackLink = styled(Link)`
  display: block;
  margin-top: 20px;
  color: #667eea;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

export default function NotFound() {
  return (
    <Container>
      <Card>
        <ErrorCode>404</ErrorCode>
        <Title>Page Not Found</Title>
        <Message>
          Oops! The page you're looking for doesn't exist or has been moved.
        </Message>
        <Button to="/">Go Home</Button>
        <BackLink to="#" onClick={() => window.history.back()}>
          ← Go back
        </BackLink>
      </Card>
    </Container>
  );
}

