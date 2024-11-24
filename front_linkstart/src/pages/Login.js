import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import du hook useNavigate
import { Container, TextField, Button, Typography, Box, Link, Card, CardContent } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import backgroundImage from '../assets/images/login-bg.jpg';
import { useUser } from '../context/UserContext'; // Import du contexte utilisateur

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null); // Gestion des erreurs
    const [loading, setLoading] = useState(false); // Indicateur de chargement
    const theme = useTheme();
    const { login } = useUser(); // Récupération de la méthode login depuis le UserContext
    const navigate = useNavigate(); // Hook pour rediriger l'utilisateur

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // Réinitialise les erreurs
        setLoading(true); // Active l'état de chargement

        try {
            const success = await login(username, password); // Appelle la méthode login du contexte
            if (success) {
                navigate('/'); // Redirige vers la page d'accueil après connexion
            } else {
                setError('Nom d’utilisateur ou mot de passe incorrect.');
            }
        } catch (err) {
            setError('Une erreur est survenue. Veuillez réessayer.');
        } finally {
            setLoading(false); // Désactive l'état de chargement
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
                        Connexion
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        {error && <Typography color="error">{error}</Typography>}
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
                            label="Mot de passe"
                            type="password"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <Link href="#" variant="body2" sx={{ display: 'block', mt: 1 }}>
                            Mot de passe oublié ?
                        </Link>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            sx={{ mt: 2 }}
                            disabled={loading} // Désactive le bouton pendant le chargement
                        >
                            {loading ? 'Connexion...' : 'Se connecter'}
                        </Button>
                    </form>
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Typography variant="body2">
                            Pas encore de compte ? <Link href="/register" variant="body2">S'inscrire</Link>
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
}

export default Login;
