<?php
    include_once 'database.php';

    $query = "SELECT * FROM photos";
    mysqli_set_charset($link,"utf8");
    $result = mysqli_query($link, $query);

    $return_arr = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $id = $row['id'];
        $photo_id = $row['photo_id'];
        $server = $row['server'];
        $farm = $row['farm'];
        $secret = $row['secret'];

        $title = $row['title'];
        $longitude = $row['longitude'];
        $latitude = $row['latitude'];
        $views = $row['views'];
        $categories = $row['categories'];
        $labels = $row['labels'];
        $description = $row['description'];

        $url = 'http://farm' . $farm . '.staticflickr.com/' . $server . '/' . $photo_id . '_' . $secret . '.jpg';

        $return_arr[] = array('id' => $id,'title' => $title, 'description' => $description, 'longitude' => $longitude, 'latitude' => $latitude, 'url' => $url, 'views' => $views, 'labels' => $labels, 'categories' => $categories);
    }
    header('Content-Type: application/json');
    echo json_encode($return_arr);
    exit;
?>
