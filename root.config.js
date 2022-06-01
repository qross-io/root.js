window.localStorage.setItem('$root.configuration', JSON.stringify({
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