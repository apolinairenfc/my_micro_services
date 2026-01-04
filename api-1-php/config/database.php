<?php

declare(strict_types=1);

use Illuminate\Database\Capsule\Manager as Capsule;

return function (array $settings): Capsule {
    $capsule = new Capsule();
    $capsule->addConnection($settings['db']);
    $capsule->setAsGlobal();
    $capsule->bootEloquent();

    return $capsule;
};
