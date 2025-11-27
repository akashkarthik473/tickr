/**
 * Error Boundary component
 * Catches React rendering errors and displays fallback UI.
 */
import React from 'react';
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
  padding: 40px;
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
`;

const Icon = styled.div`
  font-size: 4rem;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  color: #333;
  font-size: 1.75rem;
  margin-bottom: 12px;
`;

const Message = styled.p`
  color: #666;
  line-height: 1.6;
  margin-bottom: 24px;
`;

const Button = styled.button`
  padding: 14px 28px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin: 0 8px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
  }
`;

const SecondaryButton = styled(Button)`
  background: #f0f0f0;
  color: #333;
  
  &:hover {
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }
`;

const Details = styled.details`
  margin-top: 24px;
  text-align: left;
  
  summary {
    cursor: pointer;
    color: #666;
    font-size: 0.9rem;
    
    &:hover {
      color: #333;
    }
  }
  
  pre {
    background: #f5f5f5;
    padding: 16px;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 0.75rem;
    color: #c7254e;
    margin-top: 12px;
  }
`;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    
    // Log error to console (could send to error reporting service)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container>
          <Card>
            <Icon>😵</Icon>
            <Title>Something went wrong</Title>
            <Message>
              We encountered an unexpected error. Don't worry, your data is safe. 
              Try refreshing the page or go back to the home page.
            </Message>
            
            <div>
              <Button onClick={this.handleReload}>
                Refresh Page
              </Button>
              <SecondaryButton onClick={this.handleGoHome}>
                Go Home
              </SecondaryButton>
            </div>
            
            {import.meta.env.DEV && this.state.error && (
              <Details>
                <summary>Technical details</summary>
                <pre>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </Details>
            )}
          </Card>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

