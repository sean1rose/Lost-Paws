$(document).ready(function(){

  var app = {

    superArray: [
      ['Lassie', 'John Doe', 'email@email.com', 37.7835478, -122.408953],
      ['Fido', 'Haley M', 'email@email.com', 37.7847358, -122.40369140000001],
      ['Big Bertha', 'Willy McGee', 'email@email.com', 37.7870631, -122.40853019999997],
      ['Rufio', 'Helen K', 'email@email.com', 37.7800963, -122.4126862]
    ],

    displayMap: function(ladder, longer){
      var geocoder = new google.maps.Geocoder();

      var mapOptions = {
        center: { lat: ladder, lng: longer},
        zoom: 15
      };
      
      var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

      var petInfoWindowParser = function(lostPetsArray){
        var petArray = [];
        for (var i = 0; i < lostPetsArray.length; i++){
          var content = $('<div class="marker-info-win">'+
          '<div class="marker-inner-win"><span class="info-content">'+
          '<h3 class="marker-heading">' + lostPetsArray[i][0] + '</h3>'+
          'Found by: ' + lostPetsArray[i][1] + '<br>' +
          'Contact @: ' + lostPetsArray[i][2] + 
          '</span>'+
          '</div>/</div>'); 
          petArray.push(content)
        }
        return petArray;
      }

      var finalArray = petInfoWindowParser(app.superArray);

      var infoWindow = new google.maps.InfoWindow();

      var setMarkers = function(map, locations){
        var shape = {
          coords: [1,1,1,20,18,20,18,1],
          type: 'poly'
        };

        for (var i = 0; i < locations.length; i++){
          var pet = locations[i];
          var myLatLng = new google.maps.LatLng(pet[3], pet[4]);

          var marker = new google.maps.Marker({
            position: myLatLng,
            //icon: image
            map: map,
            animation: google.maps.Animation.DROP,
            title: pet[0]
          });
          
          google.maps.event.addListener(marker, 'click', (function(marker, i){
            return function(){
              infoWindow.setContent(finalArray[i][0]);
              infoWindow.open(map, marker);              
            }
          })(marker, i));
        }
      }

      console.log('ABOUT TO DISPLAY SUPERARRAY ON THE GRID - ', app.superArray);
      setMarkers(map, app.superArray);   
    },

    init: function(){
      app.server = 'http://localhost:3000';

      var finalAddress = 94102;
      
      app.displayMap(37.7833, -122.4167);

      $('#foundSubmit').on('click', app.foundSubmit);
      
      // Lost Paws Event Handler
      $('.submitButton').on('click', function(){
        var finalAddress = $('#zipCode').val();
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({'address': finalAddress}, function(results, status){
          if (status == google.maps.GeocoderStatus.OK){
            var coordObj = results[0].geometry.location;
            var lati = coordObj.k;
            var longi = coordObj.B;
            app.displayMap(lati, longi);
          } else {
            console.log('it failed foo');
          }
        });
        $('#zipCode').val('');
      });

    },

    // Found Paws Event Handler
    foundSubmit: function(e){
      e.preventDefault();
        var userName = $('#username').val();
        var email = $('#email').val();
        var petName = $('#petname').val();
        var message = [];
        message.push(userName, email, petName);
        var zipcodeFound = $('#zipcodefound').val();
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({'address': zipcodeFound}, function(results, status){
          if (status == google.maps.GeocoderStatus.OK){
            var coordObj = results[0].geometry.location;
            var lati = coordObj.k;
            var longi = coordObj.B;
            message.push(lati, longi);
            console.log('final message being sent is', message);
            app.displayMap(lati, longi);
          } else {
            console.log('it failed foo');
          }
        });
        app.send(message);
        $('#username').val('');
        $('#email').val('');
        $('#petname').val('');
        var zipcodeFound = $('#zipcodefound').val('');
        var zipInteger = zipcodeFound.toString();
    },

    send: function(message){
      $.ajax({
        url: app.server,
        type: 'POST',
        data: JSON.stringify(message),
        contentType: 'application/json',
        success: function(messsage){
          app.superArray.push(message);
          // console.log('pushing to superArray: ', message);
          // console.log('superarray consists of: ', app.superArray);
        },
        error: function(message){
          console.error(message.text + ' did not send');
        }
      })
    }

  };

  app.init();

})


