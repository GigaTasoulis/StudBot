<?php
// Make a POST request to Flask API endpoint
$url = 'http://localhost:5000/predict';
$data = array('message' => 'Hello, how can I help you?');
$options = array(
    'http' => array(
        'header'  => "Content-Type: application/json\r\n",
        'method'  => 'POST',
        'content' => json_encode($data)
    )
);
$context  = stream_context_create($options);
$response = file_get_contents($url, false, $context);
$responseData = json_decode($response, true);

// Output the response
if ($responseData && isset($responseData['response'])) {
    echo 'Response from Flask API: ' . $responseData['response'];
} else {
    echo 'Error fetching response from Flask API';
}
?>
