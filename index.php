<!doctype html>
<html lang="en">
 <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Polycademia</title>
  <link rel="icon" href="/connect/data/img/Polycademia-LOGO.png" type="image/png" >
  <link rel="shortcut icon" href="/connect/data/img/Polycademia-LOGO.png" type="image/png">
  <style>
        /* General reset */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Comic Sans MS', sans-serif;
        }
        
        body {
            background-color: #f9a67c;
        }
        
        /* Navbar */
        .navbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: #f58442;
            padding: 10px 30px;
            border-radius: 15px;
        }
        
        .logo {
            display: flex;
            align-items: center;
        }
        
        .logo img {
            width: 50px;
            margin-right: 10px;
        }
        
        .logo span {
            font-weight: bold;
            font-size: 18px;
        }
        
        .nav-links {
            display: flex;
            list-style: none;
            gap: 40px;
        }
        
        .nav-links a {
            text-decoration: none;
            color: #001F63;
            font-weight: bold;
            transition: color 0.3s ease;
        }
        
        .nav-links a:hover {
            color: white;
        }
        
        .connect-btn {
            background-color: #3b5bff;
            color: white;
            border: 2px solid rgba(255,255,255,0.3);
            border-radius: 20px;
            padding: 10px 20px;
            font-weight: bold;
            cursor: pointer;
            transition: transform 0.3s ease, background 0.3s ease;
        }
        
        .connect-btn:hover {
            transform: scale(1.1);
            background-color: #2a40c9;
        }
        
        /* Content area */
        .container {
            display: flex;
            justify-content: space-around;
            align-items: center;
            padding: 40px;
            gap: 30px;
        }
        
        .box:hover {
            transform: scale(1.05);
        }
        
        /* LIQUID GLASS STYLES */
        
        .liquidGlass-wrapper {
            position: relative;
            display: flex;
            font-weight: 600;
            overflow: hidden;
        
            color: black;
            cursor: pointer;
        
            box-shadow: 0 6px 6px rgba(0, 0, 0, 0.2), 0 0 20px rgba(0, 0, 0, 0.1);
        
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 2.2);
        }
        
        .liquidGlass-effect {
            position: absolute;
            z-index: 0;
            inset: 0;
        
            backdrop-filter: blur(3px);
            filter: url(#glass-distortion);
            overflow: hidden;
            isolation: isolate;
        }
        
        .liquidGlass-tint {
            z-index: 1;
            position: absolute;
            inset: 0;
            background: rgba(255, 255, 255, 0.25);
        }
        
        .liquidGlass-shine {
            position: absolute;
            inset: 0;
            z-index: 2;
        
            overflow: hidden;
        
            box-shadow: inset 2px 2px 1px 0 rgba(255, 255, 255, 0.5),
              inset -1px -1px 1px 1px rgba(255, 255, 255, 0.5);
        }
        
        .liquidGlass-text {
            z-index: 3;
            font-size: 2rem;
            color: black;
            display : flex
        }
        
        .dock {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            border-radius: 2rem;
            padding: 0.6rem;
        }
        
        a {
            text-decoration: none;
        }
        
        .wrapper {
            display: flex;
            gap: 25px;
            flex-direction: column;
            justify-content: center;
            align-items: flex-end;
        }
        
        .menu,
        .menu > div {
            padding: 0.4rem;
            border-radius: 1.8rem;
        }
        
        .menu:hover {
            padding: 0.6rem;
            border-radius: 1.8rem;
        }
        
        .menu > div > div {
            font-size: 20px;
            color: white;
            padding: 0.4rem 0.6rem;
            border-radius: 0.8rem;
            transition: all 0.1s ease-in;
        }
        
        .menu > div > div:hover {
            background-color: rgba(255, 255, 255, 0.5);
            box-shadow: inset -2px -2px 2px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(2px);
        }
        
        .dock {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            border-radius: 2rem;
            padding: 0.6rem;
        }
        
        .dock,
        .dock > div {
            border-radius: 2rem;
        }
        
        .dock:hover {
            padding: 0.8rem;
            border-radius: 2.5rem;
        }
        
        .dock:hover > div {
            border-radius: 2.5rem;
        }
        
        .button {
            padding: 1.5rem 2.5rem;
            border-radius: 3rem;
        }
        
        .button,
        .button > div {
            border-radius: 3rem;
        }
        
        .menu-toggle.active span:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }
        .menu-toggle.active span:nth-child(2) {
            opacity: 0;
        }
        .menu-toggle.active span:nth-child(3) {
            transform: rotate(-45deg) translate(6px, -6px);
        }

        /* Additional styles to maintain functionality */
        .nav-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            max-width: 1200px;
            margin: 0 auto;
        }

        nav ul {
            display: flex;
            list-style: none;
            margin: 0;
            padding: 0;
            gap: 2rem;
        }

        nav a {
            text-decoration: none;
            color: #001F63;
            font-weight: bold;
            transition: color 0.3s ease;
            cursor: pointer;
        }

        nav a:hover, nav a.active {
            color: white;
        }

        .language-switcher {
            padding: 0.5rem;
            border: 2px solid rgba(255,255,255,0.3);
            border-radius: 8px;
            background: #fa9357;
            color: #333;
            font-weight: 500;
        }

        /* Mobile Menu */
        .menu-toggle {
            display: none;
            flex-direction: column;
            cursor: pointer;
            padding: 0.5rem;
        }

        .menu-toggle span {
            width: 25px;
            height: 3px;
            background: #001F63;
            margin: 3px 0;
            transition: 0.3s;
        }

        /* Main Content */
        .main-content {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }

        .page-section {
            display: none;
            animation: fadeIn 0.5s ease-in;
        }

        .page-section.active {
            display: block;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* Home Page Styles */
        .hero {
            text-align: center;
            padding: 4rem 0;
            color: #001F63;
        }

        .hero h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }

        .welcome-text {
            font-size: 1.2rem;
            line-height: 1.6;
            margin-bottom: 3rem;
            max-width: 800px;
            margin-left: auto;
            margin-right: auto;
        }

        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin: 3rem 0;
        }

        .box {
            background: rgba(255, 255, 255, 0.884);
            padding: 2rem;
            border: rgba(255,255,255,0.3);
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            text-align: center;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .box h3 {
            color: #f58442;
            margin-bottom: 1rem;
            font-size: 1.3rem;
        }

        .registration-section {
            background: rgba(255, 255, 255, 0.95);
            padding: 3rem;
            border-radius: 15px;
            margin: 3rem 0;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .registration-section h2 {
            color: #f58442;
            text-align: center;
            margin-bottom: 2rem;
        }

        .registration-list {
            list-style: none;
            padding: 0;
        }

        .registration-list li {
            padding: 0.8rem 0;
            border-bottom: 1px solid #eee;
            font-size: 1.1rem;
        }

        .registration-list li:last-child {
            border-bottom: none;
        }

        /* Rules Page Styles */
        .rules-container {
            background: rgba(255, 255, 255, 0.95);
            padding: 3rem;
            border-radius: 15px;
            margin: 2rem 0;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .rules-section {
            margin: 2rem 0;
        }

        .rules-section h2 {
            color: #f58442;
            border-bottom: 2px solid #f58442;
            padding-bottom: 0.5rem;
            margin-bottom: 1.5rem;
        }

        .rules-section h3 {
            color: #001F63;
            margin: 1.5rem 0 1rem 0;
        }

        .rules-list {
            list-style: none;
            padding: 0;
        }

        .rules-list li {
            padding: 0.8rem 0;
            border-left: 3px solid #f58442;
            padding-left: 1rem;
            margin: 0.5rem 0;
            background: rgba(245, 132, 66, 0.05);
        }

        /* About Page Styles */
        .about-container {
            background: rgba(255, 255, 255, 0.95);
            padding: 3rem;
            border-radius: 15px;
            margin: 2rem 0;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            text-align: center;
        }

        .about-container h1 {
            color: #f58442;
            margin-bottom: 2rem;
        }

        .about-content {
            font-size: 1.2rem;
            line-height: 1.8;
            color: #555;
            max-width: 800px;
            margin: 0 auto;
        }

        /* Contact Page Styles */
        .contact-container {
            background: rgba(255, 255, 255, 0.95);
            padding: 3rem;
            border-radius: 15px;
            margin: 2rem 0;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .contact-container h1 {
            color: #f58442;
            text-align: center;
            margin-bottom: 2rem;
        }

        .contact-form {
            max-width: 600px;
            margin: 0 auto;
        }

        .form-group {
            margin-bottom: 1.5rem;
        }

        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            color: #333;
            font-weight: 500;
        }

        .form-group input,
        .form-group textarea {
            width: 100%;
            padding: 1rem;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 1rem;
            transition: border-color 0.3s ease;
        }

        .form-group input:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: #f58442;
        }

        .submit-btn {
            background: #f58442;
            color: white;
            padding: 1rem 2rem;
            border: none;
            border-radius: 8px;
            font-size: 1.1rem;
            cursor: pointer;
            transition: transform 0.3s ease;
            width: 100%;
        }

        .submit-btn:hover {
            transform: translateY(-2px);
            background: #e67332;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .menu-toggle {
                display: flex;
            }

            nav ul {
                display: none;
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: #f58442;
                flex-direction: column;
                padding: 1rem;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            }

            nav ul.show {
                display: flex;
            }

            .hero h1 {
                font-size: 2rem;
            }

            .main-content {
                padding: 1rem;
            }

            .features-grid {
                grid-template-columns: 1fr;
            }

            .registration-section,
            .rules-container,
            .about-container,
            .contact-container {
                padding: 2rem 1rem;
            }
        }
    </style>
  <style>@view-transition { navigation: auto; }</style>
  <script src="/_sdk/data_sdk.js" type="text/javascript"></script>
  <script src="/_sdk/element_sdk.js" type="text/javascript"></script>
  <script src="https://cdn.tailwindcss.com" type="text/javascript"></script>
 </head>
 <body><!-- Navigation -->
  <header class="navbar">
   <div class="logo">
        <img src="https://i.ibb.co/3yZfFMVJ/Polycademia-LOGO.png" alt="Polycademia Logo">
        <span>Polycademia</span>
    </div>
    <nav>
     <ul>
      <li><a href= " # " data-page="home" data-i18n="home" class="nav-link">Accueil</a></li>
      <li><a href= " # " data-page="about" data-i18n="about" class="nav-link">À propos de nous</a></li>
      <li><a href= " # " data-page="rules" data-i18n="rules" class="nav-link">Règles</a></li>
      <li><a href= " # " data-page="contacts" data-i18n="contacts" class="nav-link">Contacts</a></li>
      <li><a href= " # " data-i18n="login" class="connect-btn" onclick="window.location.href='connect/login.php';">Se connecter / S'inscrire</a></li>
     </ul>
    </nav><select id="language-switcher" class="language-switcher"> <option value="fr">Français</option> <option value="en">English</option> <option value="jp">日本語</option> <option value="es">Español</option> <option value="pf">Tahiti</option> <option value="ch">中文</option> </select>
    <div class="menu-toggle"><span></span> <span></span> <span></span>
    </div>
   </div>
  </header><!-- Main Content -->
  <main class="main-content"><!-- Home Page -->
   <section id="home-page" class="page-section active">
    <div class="hero">
     <h1>Polycademia</h1>
     <div class="welcome-text" data-i18n="welcome-paragraph-1">
      Bonjour tout le monde ! Bienvenue sur Polycademia ! <br>
      Nous sommes honorés de vous annoncer notre nouveau site <br>
      et application de Polycademia. <br>
      Polycademia est un site et une application qui se base <br>
      uniquement sur l'école.
     </div>
    </div>
    <div class="features-grid">
     <div class="box">
      <h3 data-i18n="Meeting">Réunions</h3>
      <p data-i18n="feature-1">Faire des réunions entre élèves et entre professeurs.</p>
     </div>
     <div class="box">
      <h3 data-i18n="Note">Notes</h3>
      <p data-i18n="feature-2">Avoir une vue sur les notes.</p>
     </div>
     <div class="box">
      <h3 data-i18n="School Office">Vie Scolaire</h3>
      <p data-i18n="feature-3">La vie scolaire : absences, retards, retenues.</p>
     </div>
     <div class="box">
      <h3 data-i18n="Personal Space">Espace Personnel</h3>
      <p data-i18n="feature-4">Accès à votre espace personnel (drive, session Windows/Apple). </p>
     </div>
    </div>
    <div class="registration-section">
     <h2 dat-i18n="Inscription">Inscription</h2>
     <p data-i18n="registration-intro">Pour votre inscription sur le site ou sur l'application, <br>
      il vous sera demandé :</p>
     <ul class="registration-list">
      <li data-i18n="registration-name">Votre NOM et PRÉNOM</li>
      <li data-i18n="registration-dob">Votre date de naissance</li>
      <li data-i18n="registration-id">Votre carte d'identité</li>
     </ul>
     <h3 data-i18n="after-registration">Après avoir fait votre demande d'inscription, vous aurez :</h3>
     <ul class="registration-list">
      <li data-i18n="email-info">Votre propre mail se composant des deux premières lettres de votre prénom et de votre nom de famille au complet suivie de lapremièrelettredevotreprénom.votrenomdefamilleaucomplet@polyschool.mail.(fr, pf, en...). </li>
      <li data-i18n="drive-info">Votre propre drive privé (20 Go de stockage). </li>
     </ul>
     <p data-i18n="note-info">Votre compte vous est personnel. L'établissement peut autoriser ou retirer l'accès à ses serveurs. En cas d'examen, l'établissement peut visualiser votre écran.</p>
    </div>
   </section><!-- About Page -->
   <section id="about-page" class="page-section">
    <div class="about-container">
     <h1 data-i18n="about">À propos de nous</h1>
     <div class="about-content">
      <p data-i18n="about-1">Polycademia est une plateforme éducative innovante conçue pour révolutionner l'expérience scolaire. Notre mission est de connecter étudiants, enseignants et parents dans un environnement numérique sécurisé et intuitif.</p>
      <p data-i18n="about-2">Fondée par une équipe passionnée d'éducateurs et de développeurs, Polyschool offre des outils modernes pour faciliter l'apprentissage, améliorer la communication et optimiser la gestion scolaire.</p>
      <p data-i18n="about-3">Nous croyons en l'importance de l'éducation accessible et de qualité pour tous. C'est pourquoi nous nous efforçons de créer des solutions technologiques qui soutiennent et enrichissent le parcours éducatif de chaque utilisateur.</p>
     </div>
    </div>
   </section><!-- Rules Page -->
   <section id="rules-page" class="page-section">
    <div class="rules-container">
     <h1 data-i18n="Info &amp; Condition rules">Charte Informatique &amp; Condition d'utilisation</h1>
     <div class="rules-section">
      <h2 data-i18n="requires">Autorisations Requises</h2>
      <p data-i18n="authorizations">Polycaddemia requiert certains autorisation de la part de l'utilisateur :</p>
      <ul class="rules-list">
       <li data-i18n="a1">Accès enregistrement de l'appareil électronique utilisé</li>
       <li data-i18n="a2">Espace de stockage de l'appareil utilisé</li>
       <li data-i18n="a3">Accès à la caméra de l'appareil utilisé</li>
       <li data-i18n="a4">Accès à la géolocalisation</li>
      </ul>
     </div>
     <div class="rules-section">
      <h3 data-i18n="students">Partie étudiant :</h3>
      <ul class="rules-list">
       <li data-i18n="s1">Les étudiants peuvent créer leurs propres comptes Polycademia avec ou sans l'autorisation des parents.</li>
       <li data-i18n="s2">En tant qu'étudiant, vous avez la possibilité de faire une demande à votre établissement pour l'obtention d'un code qui vous permettra d'y accéder au service que votre établissement vous founira.</li>
       <li data-i18n="s3"></li>
      </ul>
     </div>
     <div class="rules-section">
      <h3 data-i18n="parents">Partie parent :</h3>
      <ul class="rules-list">
       <li data-i18n="p1"></li>
       <li data-i18n="p2"></li>
       <li data-i18n="p3"></li>
      </ul>
     </div>
     <div class="rules-section">
      <h3 data-i18n="teachers">Partie enseignant :</h3>
      <ul class="rules-list">
       <li data-i18n="t1"></li>
       <li data-i18n="t2"></li>
       <li data-i18n="t3"></li>
      </ul>
     </div>
     <div class="rules-section">
      <h3 data-i18n="ScolarBuild">Partie établissement :</h3>
      <ul class="rules-list">
       <li data-i18n="sb1"></li>
       <li data-i18n="sb2"></li>
       <li data-i18n="sb3"></li>
      </ul>
     </div>
     <div class="rules-section">
      <h3 data-i18n="ADMIN">Partie administrateur :</h3>
      <ul class="rules-list">
       <li data-i18n="ad1"></li>
       <li data-i18n="ad2"></li>
       <li data-i18n="ad3"></li>
      </ul>
     </div>
    </div>
   </section><!-- Contact Page -->
   <section id="contacts-page" class="page-section">
    <div class="contact-container">
     <h1 data-i18n="contacts">Contacts</h1>
     <form class="contact-form" id="contact-form">
      <div class="form-group"><label for="name">Nom complet</label> <input type="text" id="name" name="name" required>
      </div>
      <div class="form-group"><label for="email">Email</label> <input type="email" id="email" name="email" required>
      </div>
      <div class="form-group"><label for="subject">Sujet</label> <input type="text" id="subject" name="subject" required>
      </div>
      <div class="form-group"><label for="message">Message</label> <textarea id="message" name="message" rows="5" required></textarea>
      </div><button type="submit" class="submit-btn">Envoyer le message</button>
     </form>
    </div>
   </section>
  </main>
  <script>
        // COMBINED TRANSLATIONS OBJECT
        const translations = {
            fr: {
                // Base navigation
                home: "Accueil",
                about: "À propos de nous",
                rules: "Règles",
                contacts: "Contacts",
                login: "Se connecter / S'inscrire",
                
                // Home page content
                "welcome-paragraph-1": "Bonjour tout le monde ! Bienvenue sur Polycademia ! <br>Nous sommes honorés de vous annoncer notre nouveau site <br>et application de Polycademia. <br> Polycademia est un site et une application qui se base <br> uniquement sur l'école.",
                "Meeting":"Réunions",
                "feature-1": "Faire des réunions entre élèves et entre professeurs.",
                "Note":"Notes",
                "feature-2": "Avoir une vue sur les notes.",
                "School Office": "Vie Scolaire",
                "feature-3": "absences, retards, retenues.",
                "Personal Space":"Espace Personnel",
                "feature-4": "Accès à votre espace personnel (drive, session Windows/Apple).",
                "Inscription":"Inscriptions",
                "registration-intro": "Pour votre inscription sur le site ou sur l'application, <br>il vous sera demandé :",
                "registration-name": "Votre NOM et PRÉNOM",
                "registration-dob": "Votre date de naissance",
                "registration-id": "Votre carte d'identité",
                "after-registration": "Après avoir fait votre demande d'inscription, vous aurez :",
                "email-info": "Votre propre mail se composant des deux premières lettres de votre prénom et de votre nom de famille au complet suivie de @polycademia.mail.org .",
                "drive-info": "Votre propre drive privé (20 Go de stockage).",
                "note-info": "Votre compte vous est personnel. L'établissement peut autoriser ou retirer l'accès à ses serveurs. En cas d'examen, l'établissement peut visualiser votre écran.",
                
                // About Us page content
                "about":"A propos de nous",
                "about-1":"Polycademia est une plateforme éducative innovante conçue pour révolutionner l'expérience scolaire. Notre mission est de connecter étudiants, enseignants et parents dans un environnement numérique sécurisé et intuitif.",
                "about-2":"Fondée par une équipe passionnée d'éducateurs et de développeurs, Polycademia offre des outils modernes pour faciliter l'apprentissage, améliorer la communication et optimiser la gestion scolaire.",
                "about-3":"Nous croyons en l'importance de l'éducation accessible et de qualité pour tous. C'est pourquoi nous nous efforçons de créer des solutions technologiques qui soutiennent et enrichissent le parcours éducatif de chaque utilisateur.",
                
                // Security page content
                "term-of-use": "Conditions d'utilisation",
                
                "privacy-policy": "Politique de confidentialité",

                // Rules page content
                "Info & Condition rules": "Charte Informatique & Condition d'utilisation",
                "requires": "Autorisations Requises",
                "authorizations": "Polycademia requiert certains autorisation de la part de l'utilisateur :",
                "a1": "Accès enregistrement de l'appareil électronique utilisé",
                "a2": "Espace de stockage de l'appareil utilisé",
                "a3": "Accès à la caméra de l'appareil utilisé",
                "a4": "Accès à la géolocalisation",
                "students": "Partie étudiant :",
                "s1": "Les étudiants peuvent créer leurs propres comptes Polycademia avec ou sans l'autorisation des parents.",
                "s2": "En tant qu'étudiant, vous avez la possibilité de faire une demande à votre établissement pour l'obtention d'un code qui vous permettra d'y accéder au service que votre établissement vous founira.",
                "s3": "",
                "parents": "Partie parent :",
                "p1": "",
                "p2": "",
                "p3": "",
                "teachers": "Partie enseignant :",
                "t1": "",
                "t2": "",
                "t3": "",
                "ScolarBuild": "Partie établissement :",
                "sb1": "",
                "sb2": "",
                "sb3": "",
                "ADMIN": "Partie administrateur :",
                "ad1": "",
                "ad2": "",
                "ad3": ""
            },

            en: {
                // Base navigation
                home: "Home",
                about: "About Us",
                rules: "Rules",
                contacts: "Contacts",
                login: "Login / Register",
                
                // Home page content
                "welcome-paragraph-1": "Hello everyone! <br> Welcome to Polycademia! <br> We are proud to announce our new website and app. <br> Polycademia is focused entirely on education.",
                "Meeting":"Meetings",
                "feature-1": "Host meetings between students and teachers.",
                "Note":"Grades",
                "feature-2": "View your grades.",
                "School Office":"School Office",
                "feature-3": "Track absences, tardiness, and detentions.",
                "Personal Space":"Personal Space",
                "feature-4": "Access your personal space (Drive, Windows/Apple session).",
                "Inscriptions":"Registers",
                "registration-intro": "To register on the website or app, you will need:",
                "registration-name": "Your full name",
                "registration-dob": "Your date of birth",
                "registration-id": "Your ID card",
                "after-registration": "After registering, you'll receive:",
                "email-info": "Your personal email made from your initials, like yourfirsletterofyourname.yourfulllastname@polycademia.mail.org .",
                "drive-info": "Your private drive (20 GB storage).",
                "note-info": "Your account is personal. The school can grant or revoke access to their server. During exams, the school can view your screen.",
                
                "about":"About US",
                "about-1":"Polycademia is an innovative educational platform designed to revolutionise the school experience. Our mission is to connect students, teachers and parents in a secure and intuitive digital environment.",
                "about-2":"Founded by a passionate team of educators and developers, Polyschool offers modern tools to facilitate learning, improve communication and optimise school management.",
                "about-3":"We believe in the importance of accessible, quality education for all. That's why we strive to create technological solutions that support and enrich the educational journey of every user.",

                // Rules page content
                "Info & Condition rules": "IT Charter and Terms of Use",
                "requires": "Authorizations Requires",
                "authorizations": "Polycademia requires certain permissions from users:",
                "a1": "Access to device recording",
                "a2": "Device storage space",
                "a3": "Access to device camera",
                "a4": "Access to geolocation",
                "students": "Student section:",
                "s1": "Students can create their own Polycademia accounts with or without parental permission.",
                "s2": "As a student, you can request a code from your institution to access the services they provide.",
                "s3": "",
                "parents": "Parent section:",
                "p1": "",
                "p2": "",
                "p3": "",
                "teachers": "Teacher section:",
                "t1": "",
                "t2": "",
                "t3": "",
                "ScolarBuild": "Institution section:",
                "sb1": "",
                "sb2": "",
                "sb3": "",
                "ADMIN": "Administrator section:",
                "ad1": "",
                "ad2": "",
                "ad3": ""
            },

            jp: {
                // Base navigation
                home: "ホーム",
                about: "私たちについて",
                rules: "ルール",
                contacts: "連絡先",
                login: "ログイン / 登録",
                
                // Home page content
                "welcome-paragraph-1": "みなさん、こんにちは！<br>Polycademiaへようこそ！<br>新しいPolycademiaのウェブサイトとアプリをご紹介できることを嬉しく思います。<br>Polycademiaは教育に特化したサービスです。",
                "Meeting":"",
                "feature-1": "生徒と教師の間で会議を行う。",
                "Note":"",
                "feature-2": "成績を確認する。",
                "School Office":"",
                "feature-3": "学校生活：欠席、遅刻、居残り。",
                "Personal Space":"",
                "feature-4": "個人スペースにアクセス（ドライブ、Windows/Appleセッション）。",
                "Inscription":"",
                "registration-intro": "サイトまたはアプリに登録するには、次が必要です：",
                "registration-name": "氏名",
                "registration-dob": "生年月日",
                "registration-id": "身分証明書",
                "after-registration": "登録後、次のものが提供されます：",
                "email-info": "あなた専用のメールアドレス（例：最初のイニシャル＋姓@polycademia.mail.org 。",
                "drive-info": "20GBの個人用ドライブ。",
                "note-info": "アカウントは個人専用です。学校はアクセスを許可または取り消すことができます。試験中には学校があなたの画面を確認できます。",
                
                "about":"",
                "about-1":"",
                "about-2":"",
                "about-3":"",

                // Rules page content
                "Info & Condition rules": "IT規約と利用条件",
                "authorizations": "Polycademiaはユーザーから特定の許可が必要です：",
                "a1": "使用デバイスの記録へのアクセス",
                "a2": "使用デバイスのストレージスペース",
                "a3": "使用デバイスのカメラへのアクセス",
                "a4": "位置情報へのアクセス",
                "students": "学生セクション：",
                "s1": "学生は保護者の許可の有無に関わらず、独自のPolycademiaアカウントを作成できます。",
                "s2": "学生として、所属機関にコードを要求して、機関が提供するサービスにアクセスできます。",
                "s3": "",
                "parents": "保護者セクション：",
                "p1": "",
                "p2": "",
                "p3": "",
                "teachers": "教師セクション：",
                "t1": "",
                "t2": "",
                "t3": "",
                "ScolarBuild": "教育機関セクション：",
                "sb1": "",
                "sb2": "",
                "sb3": "",
                "ADMIN": "管理者セクション：",
                "ad1": "",
                "ad2": "",
                "ad3": ""
            },

            es: {
                // Base navigation
                home: "Inicio",
                about: "Sobre nosotros",
                rules: "Reglas",
                contacts: "Contactos",
                login: "Iniciar sesión / Registrarse",
                
                // Home page content
                "welcome-paragraph-1": "¡Hola a todos!<br>¡Bienvenidos a Polycademia!<br>Estamos orgullosos de anunciar nuestro nuevo sitio web y aplicación.<br>Polycademia está dedicado completamente a la educación.",
                "Meeting":"",
                "feature-1": "Organizar reuniones entre estudiantes y profesores.",
                "Note":"",
                "feature-2": "Ver tus calificaciones.",
                "School Office":"",
                "feature-3": "Vida escolar: ausencias, retrasos, sanciones.",
                "Personal Space":"",
                "feature-4": "Accede a tu espacio personal (Drive, sesión Windows/Apple).",
                "Incription":"",
                "registration-intro": "Para registrarte en el sitio o en la aplicación, necesitarás:",
                "registration-name": "Tu nombre completo",
                "registration-dob": "Tu fecha de nacimiento",
                "registration-id": "Tu tarjeta de identidad",
                "after-registration": "Después de registrarte, obtendrás:",
                "email-info": "Tu propio correo electrónico formado por tus iniciales, como inicialdenombre.apellido@polycademia.mail.org .",
                "drive-info": "Tu propio drive privado (20 GB de almacenamiento).",
                "note-info": "Tu cuenta es personal. La escuela puede autorizar o retirar el acceso a sus servidores. Durante los exámenes, la escuela puede ver tu pantalla.",
                
                "about":"",
                "about-1":"",
                "about-2":"",
                "about-3":"",

                // Rules page content
                "Info & Condition rules": "Carta Informática y Condiciones de Uso",
                "authorizations": "Polycademia requiere ciertos permisos de los usuarios:",
                "a1": "Acceso a la grabación del dispositivo",
                "a2": "Espacio de almacenamiento del dispositivo",
                "a3": "Acceso a la cámara del dispositivo",
                "a4": "Acceso a la geolocalización",
                "students": "Sección de estudiantes:",
                "s1": "Los estudiantes pueden crear sus propias cuentas de Polycademia con o sin permiso de los padres.",
                "s2": "Como estudiante, puedes solicitar un código a tu institución para acceder a los servicios que proporcionan.",
                "s3": "",
                "parents": "Sección de padres:",
                "p1": "",
                "p2": "",
                "p3": "",
                "teachers": "Sección de profesores:",
                "t1": "",
                "t2": "",
                "t3": "",
                "ScolarBuild": "Sección de institución:",
                "sb1": "",
                "sb2": "",
                "sb3": "",
                "ADMIN": "Sección de administrador:",
                "ad1": "",
                "ad2": "",
                "ad3": ""
            },

            pf: {
                // Base navigation
                home: "Ha'amata",
                about: "No matou",
                rules: "Ture",
                contacts: "Faaite",
                login: "A tomo / Haamau",
                
                // Home page content
                "welcome-paragraph-1": "Ia ora na i te taatoaraa!<br>Maeva i Polycademia!<br>Te oaoa nei matou i te faaite atu i ta matou vahi api e te faanahoraa Polycademia.<br>Polycademia e hiro'a e faaterehia na te haapiiraa.",
                "Meeting":"",
                "feature-1": "Faaapiti i te faaroo i rotopu i te pīra e te haapii.",
                "Note":"",
                "feature-2": "Hio i to oe faito.",
                "School Office":"",
                "feature-3": "Oraraa i te fare haapiiraa: moe, taere, tapea.",
                "Personal Space":"",
                "feature-4": "A tomo i to oe vahi iho (drive, tauraa Windows/Apple).",
                "Insccriptio":"",
                "registration-intro": "No te rēhita i nia i te vahi aore ra te faanahoraa, e hinaaro oe i:",
                "registration-name": "To oe i'oa e te i'oa fa'a'amu",
                "registration-dob": "To oe mahana fanauraa",
                "registration-id": "To oe buka ti'araa",
                "after-registration": "I muri a'e i te rēhista, e riro ia oe:",
                "email-info": "To oe iho tumu parau roro uira (ex: ta oe matamua matahiti.e to oe i'oa atoa@polycademia.mail.org .",
                "drive-info": "To oe iho drive parau tia (20 GO no te putuputuraa).",
                "note-info": "To oe account no oe ana'e. E nehenehe te fare haapiiraa e horo'a e aore ra e tatara i te tomo i ta ratou server. I te tau faa'oraa, e nehenehe te fare haapiiraa e hio i to oe mata.",
                
                "about":"",
                "about-1":"",
                "about-2":"",
                "about-3":"",

                // Rules page content
                "Info & Condition rules": "Ture Informatique e Condition",
                "authorizations": "Polycademia e hinaaro nei i te mau autorisation mai te taata:",
                "a1": "Tomo i te putuputu o te apareil electronique",
                "a2": "Vahi putuputu o te apareil",
                "a3": "Tomo i te mata o te apareil",
                "a4": "Tomo i te vahi",
                "students": "Haapiiraa:",
                "s1": "Te mau haapiiraa e nehenehe ia ratou e haamau i ta ratou iho account Polycademia ma te autorisation o te metua aore ra.",
                "s2": "E haapiiraa oe, e nehenehe ia oe e patoi i to oe fare haapiiraa no te riro i te code e faaite ia oe e tomo ai i te service.",
                "s3": "",
                "parents": "Metua:",
                "p1": "",
                "p2": "",
                "p3": "",
                "teachers": "Haapii:",
                "t1": "",
                "t2": "",
                "t3": "",
                "ScolarBuild": "Fare haapiiraa:",
                "sb1": "",
                "sb2": "",
                "sb3": "",
                "ADMIN": "Administrateur:",
                "ad1": "",
                "ad2": "",
                "ad3": ""
            },

            ch: {
                // Base navigation
                home: "首页",
                about: "关于我们",
                rules: "规则",
                contacts: "联系人",
                login: "登录 / 注册",
                
                // Home page content
                "welcome-paragraph-1": "大家好！<br>欢迎来到Polycademia！<br>我们很荣幸地宣布我们新的Polycademia网站和应用程序。<br>Polycademia是一个完全专注于教育的平台。",
                "Meeting":"",
                "feature-1": "召开学生和教师会议。",
                "Note":"",
                "feature-2": "查看成绩。",
                "School Office":"",
                "feature-3": "校园生活：缺席、迟到、留堂。",
                "Personal Space":"",
                "feature-4": "访问个人空间（硬盘、Windows/Apple会话）。",
                "Inscription":"",
                "registration-intro": "要在网站或应用程序上注册，您需要：",
                "registration-name": "您的姓名",
                "registration-dob": "您的出生日期",
                "registration-id": "您的身份证",
                "after-registration": "注册后，您将获得：",
                "email-info": "您的专属邮箱（例如：名字首字母.全姓@polycademia.mail.org 。",
                "drive-info": "您的个人云盘（20 GB 存储）。",
                "note-info": "您的账户是个人专用的。学校可以授权或撤销访问权限。在考试期间，学校可以查看您的屏幕。",
                
                "about":"",
                "about-1":"",
                "about-2":"",
                "about-3":"",

                // Rules page content
                "Info & Condition rules": "信息技术章程和使用条款",
                "authorizations": "Polycademia需要用户的某些权限：",
                "a1": "访问设备录制功能",
                "a2": "设备存储空间",
                "a3": "访问设备摄像头",
                "a4": "访问地理位置",
                "students": "学生部分：",
                "s1": "学生可以在有或没有家长许可的情况下创建自己的Polycademia账户。",
                "s2": "作为学生，您可以向您的机构申请代码以访问他们提供的服务。",
                "s3": "",
                "parents": "家长部分：",
                "p1": "",
                "p2": "",
                "p3": "",
                "teachers": "教师部分：",
                "t1": "",
                "t2": "",
                "t3": "",
                "ScolarBuild": "机构部分：",
                "sb1": "",
                "sb2": "",
                "sb3": "",
                "ADMIN": "管理员部分：",
                "ad1": "",
                "ad2": "",
                "ad3": ""
            }
        };

        // LANGUAGE SWITCHING FUNCTIONALITY
        const switchLanguage = (lang) => {
            document.querySelectorAll("[data-i18n]").forEach(el => {
                const key = el.getAttribute("data-i18n");
                el.innerHTML = translations[lang][key] || key;
            });
        };

        // Language management with detection + saving
        const getSavedLanguage = () => {
            return localStorage.getItem("preferredLanguage");
        };

        const detectBrowserLanguage = () => {
            const browserLang = navigator.language.slice(0, 2);
            return translations[browserLang] ? browserLang : "en";
        };

        const setLanguage = (lang) => {
            switchLanguage(lang);
            localStorage.setItem("preferredLanguage", lang);
            const languageSwitcher = document.getElementById("language-switcher");
            if (languageSwitcher) {
                languageSwitcher.value = lang;
            }
        };

        // PAGE NAVIGATION FUNCTIONALITY
        const showPage = (pageId) => {
            // Hide all pages
            document.querySelectorAll('.page-section').forEach(page => {
                page.classList.remove('active');
            });
            
            // Show selected page
            const targetPage = document.getElementById(pageId + '-page');
            if (targetPage) {
                targetPage.classList.add('active');
            }
            
            // Update active nav link
            document.querySelectorAll.nav-link.forEach(link => {
                link.classList.remove('active');
            });
            
            const activeLink = document.querySelector(`[data-page="${pageId}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }
        };

        // MOBILE MENU FUNCTIONALITY
        const initMobileMenu = () => {
            const menuToggle = document.querySelector(".menu-toggle");
            const navMenu = document.querySelector("nav ul");
            
            if (menuToggle && navMenu) {
                menuToggle.addEventListener("click", function () {
                    navMenu.classList.toggle("show");
                    menuToggle.classList.toggle("active");
                });
            }
        };

        // PAGE LOAD ANIMATIONS
        const initAnimations = () => {
            const navbar = document.querySelector(".navbar");
            const boxes = document.querySelectorAll(".box");

            // Navbar animation
            if (navbar) {
                navbar.style.opacity = 0;
                navbar.style.transform = "translateY(-50px)";
                setTimeout(() => {
                    navbar.style.transition = "all 0.8s ease";
                    navbar.style.opacity = 1;
                    navbar.style.transform = "translateY(0)";
                }, 200);
            }

            // Boxes animation
            boxes.forEach((box, index) => {
                box.style.opacity = 0;
                box.style.transform = "scale(0.5)";
                setTimeout(() => {
                    box.style.transition = "all 0.6s ease";
                    box.style.opacity = 1;
                    box.style.transform = "scale(1)";
                }, 400 + index * 300);
            });
        };

        // CONTACT FORM FUNCTIONALITY
        const initContactForm = () => {
            const contactForm = document.getElementById('contact-form');
            if (contactForm) {
                contactForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    
                    // Get form data
                    const formData = new FormData(contactForm);
                    const name = formData.get('name');
                    const email = formData.get('email');
                    const subject = formData.get('subject');
                    const message = formData.get('message');
                    
                    // Simple validation
                    if (!name || !email || !subject || !message) {
                        showNotification('Veuillez remplir tous les champs.', 'error');
                        return;
                    }
                    
                    // Simulate form submission
                    showNotification('Message envoyé avec succès!', 'success');
                    contactForm.reset();
                });
            }
        };

        // NOTIFICATION SYSTEM
        const showNotification = (message, type = 'info') => {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 2rem;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 10000;
                animation: slideIn 0.3s ease;
                ${type === 'success' ? 'background: #4CAF50;' : ''}
                ${type === 'error' ? 'background: #f44336;' : ''}
                ${type === 'info' ? 'background: #2196F3;' : ''}
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }, 3000);
        };

        // Add notification animations to CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);

        // INITIALIZATION
        document.addEventListener("DOMContentLoaded", () => {
            // Initialize language
            const initialLang = getSavedLanguage() || detectBrowserLanguage();
            setLanguage(initialLang);
            
            // Set up language switcher event listener
            const languageSwitcher = document.getElementById("language-switcher");
            if (languageSwitcher) {
                languageSwitcher.addEventListener("change", (e) => {
                    setLanguage(e.target.value);
                });
            }
            
            // Set up navigation event listeners
            document.querySelectorAll('.nav-link[data-page]').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const pageId = link.getAttribute('data-page');
                    showPage(pageId);
                });
            });
            
            // Initialize mobile menu
            initMobileMenu();
            
            // Initialize animations
            initAnimations();
            
            // Initialize contact form
            initContactForm();
        });
    </script>
 <script>(function(){function c(){var b=a.contentDocument||a.contentWindow.document;if(b){var d=b.createElement('script');d.innerHTML="window.__CF$cv$params={r:'996e54e2373fb589',t:'MTc2MTg2MzE1OC4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";b.getElementsByTagName('head')[0].appendChild(d)}}if(document.body){var a=document.createElement('iframe');a.height=1;a.width=1;a.style.position='absolute';a.style.top=0;a.style.left=0;a.style.border='none';a.style.visibility='hidden';document.body.appendChild(a);if('loading'!==document.readyState)c();else if(window.addEventListener)document.addEventListener('DOMContentLoaded',c);else{var e=document.onreadystatechange||function(){};document.onreadystatechange=function(b){e(b);'loading'!==document.readyState&&(document.onreadystatechange=e,c())}}}})();</script></body>
</html>
