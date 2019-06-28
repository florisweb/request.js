/**
* author: Floris Bollen <license@florisweb.tk>
* version: 1.0.0
* license: MIT
*/

var REQUEST = new function() {
  this.send = function(_url = "", _paramaters = "", _maxAttempts = 1) {
    let request = createRequestObject(_url, _paramaters, _maxAttempts);
    sendRequest(request);
    return request.promise;
  }

  function createRequestObject(_url, _paramaters, _maxAttempts) {
    let requestObj = {
      url:          String(_url),
      paramaters:   String(_paramaters),
      
      maxAttempts:  parseInt(_maxAttempts),
      attempts:     0,
      isExpired:    requestIsExpired
    }; 

    requestObj.promise = new Promise(
        function (resolve, reject)
        {
          requestObj.resolve = resolve;
          requestObj.reject = reject;
        }
    );

    return requestObj; 
  }

  function requestIsExpired() {
    return this.attempts >= this.maxAttempts;
  }


  
  function sendRequest(_request) {
    _request.attempts++;
    
    sendActualRequest(_request).then(
      function (_response) {
        let data = _response.responseText;
        try {
          data = JSON.parse(data);
        }
        catch (e) {}

        _request.resolve(data, _response);
      }
    ).catch(
      function(_error) {
        if (_request.isExpired()) return _request.reject(_error);
        setTimeout(sendRequest, 1000, _request); //try again
      }
    )

  }


  function sendActualRequest(_request) {
    return new Promise(
      function (resolve, reject)
      {
        let xhttp = new XMLHttpRequest();
       
        xhttp.onload = function (_data) {
          let response = _data.target;
          if (response.status == 200) return resolve(response);
          reject(response);
        }
       
        xhttp.open("POST", _request.url, true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.send(_request.paramaters);
      }
    );
  }
}