function getAuthorizationHelper(appTenantDomainName, appPrincipalId, password)
{
    OAUTH_URL = "https://login.windows.net/apactenant1.onmicrosoft.com/oauth2/token?api-version=1.0";
    GRAPH_DOMAIN = "graph.windows.net";
    GRAPH_PRINCIPAL_ID = "00000002-0000-0000-c000-000000000000";

    /*
    clientSecret = encodeURIComponent(password)
    // Information about the resource we need access for which in this case is graph.
    graphId = 'https://graph.windows.net';
    protectedResourceHostName = 'graph.windows.net';
    graphPrincipalId = encodeURIComponent(graphId);
    // Information about the app
    clientPrincipalId = encodeURIComponent(appPrincipalId);
        
    // Construct the body for the STS request
    authenticationRequestBody = 'grant_type=client_credentials&client_secret=' + clientSecret + '&' + 'resource=' + graphPrincipalId + '&' + 'client_id=' + clientPrincipalId

    stsUrl = 'https://login.windows.net/' + appTenantDomainName + '/oauth2/token?api-version=1.0';
    */

    postData = {
        "grant_type": "client_credentials",
        "resource": GRAPH_PRINCIPAL_ID + "/" + GRAPH_DOMAIN + "@" + appTenantDomainName,
        "client_id": appPrincipalId + "@" + appTenantDomainName,
        "client_secret": password,
    }
    
    $.ajax({
        type: "POST",
        beforeSend: function (request) {        
            request.overrideMimeType("application/x-www-form-urlencoded");
        },
        url: OAUTH_URL,
        data: encodeURIComponent(postData),
        processData: true,
        cache: false,
        success: function (msg) {
            $("#results").append("The result =" + StringifyPretty(msg));
        },
        done: function() {
            alert( "success" );
        },
        fail: function() {
            alert( "error" );
        },
    });

    /*
    //Using curl to post the information to STS and get back the authentication response    
    $ch = curl_init();
    // set url 
    stsUrl = 'https://login.windows.net/' + appTenantDomainName + '/oauth2/token?api-version=1.0';
    curl_setopt($ch, CURLOPT_URL, $stsUrl); 
    // Get the response back as a string 
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 
    // Mark as Post request
    curl_setopt($ch, CURLOPT_POST, 1);
    // Set the parameters for the request
    curl_setopt($ch, CURLOPT_POSTFIELDS,  $authenticationRequestBody);
        
    // By default, HTTPS does not work with curl.
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

    // read the output from the post request
    $output = curl_exec($ch);         
    // close curl resource to free up system resources
    curl_close($ch);      
    // decode the response from sts using json decoder    
    tokenOutput = JSON.parse(output)
    
    return 'Authorization:' . $tokenOutput->{'token_type'}.' '.$tokenOutput->{'access_token'};
    */
}