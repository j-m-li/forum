<?php
// This software is dedicated to the public domain.
// Made with the help of Copilot GPT-4.1
//

header("Content-Type: application/json");
require_once 'utils.php';
$user = get_authenticated_user();
if ($user) {
    $userFile = "$GLOBALS[dataDir]/users/{$user['username']}.json";
    unset($user['token']);
    file_put_contents($userFile, json_encode($user, JSON_PRETTY_PRINT));
}
echo json_encode(["ok" => true]);
exit;
