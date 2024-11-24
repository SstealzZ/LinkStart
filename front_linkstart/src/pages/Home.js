import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useUser } from '../context/UserContext';
import ServiceGrid from '../components/ServiceGrid';

const Home = () => {
  const { user } = useUser();

  return (
    <>
      <Header />
      <Container
        maxWidth="xl"
        sx={{
          marginTop: 4,
          padding: '0 16px',
          boxSizing: 'border-box',
          overflowX: 'hidden',
        }}
      >
        {/* Header Section */}
        <Box textAlign="center" mb={4}>
          <Typography variant="h2" component="h1" gutterBottom>
            {user ? `Welcome back ${user.username}` : 'Welcome to My App'}
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {process.env.REACT_APP_DESCRIPTION}
          </Typography>
        </Box>

        {/* Service Grid Section */}
        <ServiceGrid />
      </Container>
      <Footer />
    </>
  );
};

export default Home;
