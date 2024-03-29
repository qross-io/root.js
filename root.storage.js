
$cookie = function (name, value, expires, path, domain) {
	/// <summary>读取或设置cookie</summary>
	/// <param name="name" type="String">名称</param>
	/// <param name="value" type="String">值</param>
	/// <param name="domain" type="String">域</param>
	/// <param name="expires" type="Integer">存活时间, 单位秒</param>
	/// <param name="path" type="String">路径</param>

	//	document.cookie = 'cookieName=cookieData
	//	[; expires=timeInGMTString]
	//	[; path=pathName]
	//	[; domain=domainName]
	//	[; secure]'
	//	document.cookie = 'name=value; expires=' + expiresTime.toGMTString() + '; path=/; domain=soufun.com';

	//no args - load
	//one arg - get
	//more args	- set
    if (arguments.length < 2) {
    	//load
		let c = document.cookie;
		if(c != '') {
			c = c.split('; ');
			for(let i = 0; i < c.length; i++)	{
				if(c[i].indexOf('=') > 0)	{
					//cookie = c[i].split('=');
					$cookie[c[i].substring(0, c[i].indexOf('='))] = c[i].substring(c[i].indexOf('=')+1);
				}
			}
		}

		//get
		if (name != null) {
            return ($cookie[name] != undefined ? $cookie[name] : '');
		}
	}
	else {
		//set
		let cookie = name + '=' + value;
		if (expires != null) {
			let expiresTime = new Date();
			let expiresTicks = expiresTime.getTime() + (expires * 1000);
			expiresTime.setTime(expiresTicks);

			cookie += '; expires=' + expiresTime.toGMTString();
		}
		if (path == null) {
			path = '/';
		}
		cookie += '; path=' + path;
		if (domain != null) {
			cookie += '; domain=' + domain;
		}

		document.cookie = cookie;
	}
}
$cookie();

//it doesn't work
$cookie.remove = function(name) {
	$cookie(name, '', -1);
}

$storage = {};

$storage.get = function(name, defaultValue) {
	return window.localStorage.getItem(name) ?? defaultValue;
}

$storage.set = function(name, value) {
	window.localStorage.setItem(name, value);
}

$storage.setifo = function(name, value) {
	if (window.localStorage.getItem(name) == null) {
		window.localStorage.setItem(name, value);
	}
};

$storage.setifo('guid', String.generateGUID());

$storage.remove = function(name) {
    window.localStorage.removeItem(name);
}

$storage.clear = function() {
    window.localStorage.clear();
}

$session = {};

$session.get = function(name) {
	return window.sessionStorage.getItem(name);
}

$session.set = function(name, value) {
	window.sessionStorage.setTime(name, value);
}

$session.clear = function() {
    window.sessionStorage.clear();
}