import React, { useContext, useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid, TextField } from '@mui/material';
import ServiceContext from '../context/ServiceContext';
import GenerateIP from '../components/GenerateIP';
import LanguageIcon from '@mui/icons-material/Language';
import LockIcon from '@mui/icons-material/Lock';
import WebsiteStatus from './WebsiteStatus';
import GenerateName from '../components/GenerateName';

const ServiceGrid = () => {
  const { services } = useContext(ServiceContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredServices, setFilteredServices] = useState([]);

  useEffect(() => {
    setFilteredServices(services);
  }, [services]);

  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = services.filter(
      (service) =>
        service.name.toLowerCase().includes(term) ||
        service.public_ip.toLowerCase().includes(term) ||
        service.private_ip.toLowerCase().includes(term)
    );

    setFilteredServices(filtered);
  };

  return (
    <Box>
      {/* Search Bar */}
      <Box display="flex" justifyContent="center" sx={{ marginBottom: 4 }}>
        <TextField
          label="Search Services"
          variant="outlined"
          fullWidth
          sx={{
            maxWidth: 500,
            '& .MuiOutlinedInput-root': {
              borderRadius: '20px',
            },
            '& .MuiInputLabel-root': {
              borderRadius: '20px',
            },
          }}
          value={searchTerm}
          onChange={handleSearch}
        />
      </Box>

      {/* Grid Section */}
      {filteredServices.length === 0 ? (
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          sx={{ height: '100vh' }}
        >
          <Typography variant="h6" align="center" sx={{ marginTop: 0 }}>
            No services found (┬┬﹏┬┬)
          </Typography>
        </Box>
      ) : (
        <Grid
          container
          spacing={2}
          sx={{
            padding: 0,
            margin: 0,
            justifyContent: 'flex-start', // Align items from left-to-right
            alignContent: 'flex-start', // Ensure items are packed to the top
          }}
        >
          {filteredServices.map((service) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={service.id}>
              <Card sx={{ width: '100%' }}>
                <CardContent sx={{ padding: 2 }}>
                  <GenerateName 
                    name={service.name} 
                    serviceId={service.id} 
                  />
                  <GenerateIP ip={service.public_ip} Icon={LanguageIcon} />
                  <GenerateIP ip={service.private_ip} Icon={LockIcon} />
                  <WebsiteStatus ip={service.private_ip} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ServiceGrid;
