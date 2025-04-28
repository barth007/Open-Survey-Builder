import React from 'react';
import { useAuth } from '@/providers/AuthProvider';

const Profile = () => {
  const { user, isLoading } = useAuth();  // Usa `useAuth` per accedere ai dati dell'utente

  if (isLoading) {
    return <div>Loading...</div>;  // Mostra un indicatore di caricamento mentre i dati sono in fase di recupero
  }

  if (!user) {
    return <div>User is not authenticated</div>;  // Se non c'è un utente autenticato
  }

  // Ora puoi accedere ai dettagli dell'utente tramite `user`
  return (
    <div>
      <h1>Profile</h1>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Name:</strong> {user.user_metadata?.full_name || "No name provided"}</p>
      {/* Mostra altri dettagli dell'utente se disponibili */}
    </div>
  );
};

export default Profile;
