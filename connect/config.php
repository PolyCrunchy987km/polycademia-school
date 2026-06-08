<?php

$host = "db.fr-pari1.bengt.wasmernet.com:10272";
$dbname = "users";
$user = "user_bbd814b7";
$pass = "pw_29134cee";

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    die("Erreur : " . $conn->connect_error);
}

?>
