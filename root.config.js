window.localStorage.setItem('$root.configuration', JSON.stringify({
    "debug": false,
    "ajax": {
        "/api/": {
            "fields": ["code", "data", "message"], //for identity
            "ready": "code != null && code == 200",
            "info": "/message",
            "path": "/data"
        }
    },
    "singleSelector": '$',
    "multipleSelector": '$$'
}));