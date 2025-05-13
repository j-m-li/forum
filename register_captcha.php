<?php
// This software is dedicated to the public domain.
// Made with the help of Copilot GPT-4.1
//

header("Content-Type: application/json");
require_once 'xmlrpc.php';

$dataDir = $dataDir . '/captcha';

if (!is_dir($dataDir)) mkdir($dataDir, 0777, true);

if (isset($_GET['get'])) {
    $a = rand(1, 10);
    $b = rand(1, 10);
    $answer = $a + $b;
    $captcha_id = bin2hex(random_bytes(8));
    file_put_contents("$dataDir/$captcha_id.txt", $answer);
    echo json_encode(['question' => " $a + $b?", 'captcha_id' => $captcha_id]);
    exit;
}
