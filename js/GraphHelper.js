function encode_utf8(s) {
    return unescape(encodeURIComponent(s));
}

function decode_utf8(s) {
    return decodeURIComponent(escape(s));
}

function GraphHelper(appTenantDomainName, appPrincipalId, password)
{
    OAUTH_URL = "https://login.windows.net/" + appTenantDomainName + "/oauth2/token?api-version=1.0";
    GRAPH_DOMAIN = "graph.windows.net";
    GRAPH_PRINCIPAL_ID = "00000002-0000-0000-c000-000000000000";
    
    GraphPrincipalId = "https://graph.windows.net";    
    GraphServiceVersion = "2013-04-05"; 

    postData = "grant_type=client_credentials";            
    postData += "&resource=" + encodeURIComponent(GRAPH_PRINCIPAL_ID);
    postData += "&client_id=" + encodeURIComponent(appPrincipalId);
    postData += "&client_secret=" + encodeURIComponent(password);

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.66 Safari/537.36",
    }

    $.ajax({
        type: "POST",
        contenttype: "application/x-www-form-urlencoded",
        headers: headers,
        url: OAUTH_URL,
        data: postData,    
        cache: false,
        success: function (response) {            
            token = response;
            PrepareDirectoryService(token);
        },
        done: function() {
            console.log("success");
        },
        fail: function() {
            console.log("fail");
        },
    });    
}
