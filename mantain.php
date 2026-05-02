<?php
// Si tu veux, tu peux limiter l'accès au site complet avec ce fichier
// Exemple : rediriger tout vers cette page temporairement
header("HTTP/1.1 503 Service Unavailable");
header("Retry-After: 3600"); // 1 heure avant que les robots retestent
?>
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Maintenance en cours</title>
  <style>
    body {
      margin: 0;
      background-color: #f49c6b;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      flex-direction: column;
      font-family: 'Poppins', sans-serif;
      color: #222;
      text-align: center;
    }

    .logo {
      width: 100px;
      margin-bottom: 20px;
      animation: float 3s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    h1 {
      font-size: 2rem;
      color: #1e1e1e;
      margin-bottom: 10px;
    }

    p {
      color: #333;
      font-size: 1.1rem;
      margin-bottom: 40px;
    }

    /* Animation de chargement */
    .loader {
      width: 80px;
      height: 80px;
      border: 8px solid rgba(255,255,255,0.3);
      border-top: 8px solid #054f9e;
      border-radius: 50%;
      animation: spin 1.5s linear infinite;
      box-shadow: 0 0 10px rgba(0,0,0,0.2);
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    footer {
      position: absolute;
      bottom: 20px;
      font-size: 0.9rem;
      color: #555;
    }
  </style>
</head>
<body>

  <!-- Logo (tu peux mettre ton image ici) -->
  <img src="https://i.ibb.co/cKjh6W5r/Polycademia.png" alt="Polyschool Logo" class="logo">

  <h1>Polycademia est temporairement en maintenance 🔧</h1>
  <p>Nous mettons à jour nos serveurs et améliorons votre expérience.<br>Merci de revenir un peu plus tard.</p>

  <div class="loader"></div>

  <footer>
    © 2026 Polycademia - Tous droits réservés
  </footer>

  <script>
    // Animation JS : effet d’apparition fluide
    document.body.style.opacity = 0;
    document.body.style.transition = "opacity 1.5s ease";
    window.addEventListener("load", () => {
      document.body.style.opacity = 1;
    });
  </script>

</body>
</html>
