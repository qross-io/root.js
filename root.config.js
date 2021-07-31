var $configuration = {
    "debug": false,
    "ajax": {
        "/api/": {
            "ready": "code != null && code == 200",
            "info": "/message",
            "path": "/data"
        }
    }
}