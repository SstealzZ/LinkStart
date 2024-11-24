import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography, Box, Link, Card, CardContent } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import backgroundImage from '../assets/images/login-bg.jpg';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const theme = useTheme();
    const { register } = useUser();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        console.log('Formulaire d\'inscription soumis avec:', { username, email, password });
        e.preventDefault();
        if (username.length <= 2) {
            setError('Le nom d\'utilisateur doit contenir plus de 3 caractères.');
            return;
        }
        if (password.length <= 7) {
            setError('Le mot de passe doit contenir plus de 7 caractères.');
            return;
        }
        setError(''); // Réinitialiser l'erreur si tout est bon
        const success = await register(username, email, password);
        console.log('Résultat de l\'inscription:', success);
        if (success) {
            navigate('/');
        } else {
            alert('Une erreur est survenue lors de l\'inscription. Veuillez réessayer.');
        }
    };

    useEffect(() => {
        // Désactiver le défilement
        document.body.style.overflow = 'hidden';
        return () => {
            // Réactiver le défilement lors du démontage du composant
            document.body.style.overflow = 'unset';
        };
    }, []);

    return (
        <Container 
            maxWidth="xs" 
            sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh', 
                position: 'relative', 
                overflow: 'hidden', 
            }}
        >
            <Box 
                sx={{ 
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: `url(${backgroundImage})`, 
                    backgroundSize: 'cover', 
                    backgroundPosition: 'center', 
                    backgroundRepeat: 'no-repeat', 
                    zIndex: -1, 
                    filter: 'blur(1px)',
                    opacity: 0.8,
                }} 
            />
            <Card>
                <CardContent sx={{ 
                    backgroundColor: theme.palette.background.paper,
                }}>
                    <Typography variant="h5" component="h1" gutterBottom>
                        Inscription
                    </Typography>
                    {error && <Typography color="error">{error}</Typography>}
                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="Nom d'utilisateur"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <TextField
                            label="E-mail"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <TextField
                            label="Mot de passe"
                            type="password"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <TextField
                            label="Confirmer le mot de passe"
                            type="password"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            sx={{ mt: 2 }}
                        >
                            S'inscrire
                        </Button>
                    </form>
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Typography variant="body2">
                            Déjà un compte ? <Link href="/login" variant="body2">Se connecter</Link>
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
}

export default Register;
