PrimeFaces.widget.GMap=PrimeFaces.widget.DeferredWidget.extend({init:function(a){this._super(a);this.renderDeferred()},_render:function(){this.map=new google.maps.Map(document.getElementById(this.id),this.cfg);this.cfg.fitBounds=!(this.cfg.fitBounds===false);this.viewport=this.map.getBounds();if(this.cfg.markers){this.configureMarkers()}if(this.cfg.polylines){this.configurePolylines()}if(this.cfg.polygons){this.configurePolygons()}if(this.cfg.circles){this.configureCircles()}if(this.cfg.rectangles){this.configureRectangles()}this.configureEventListeners();if(this.cfg.fitBounds&&this.viewport){this.map.fitBounds(this.viewport)}if(this.cfg.infoWindow){var a=this;google.maps.event.addListener(this.cfg.infoWindow,"domready",function(){a.loadWindow(a.cfg.infoWindowContent)})}},getMap:function(){return this.map},getInfoWindow:function(){return this.cfg.infoWindow},loadWindow:function(a){this.jq.find(PrimeFaces.escapeClientId(this.getInfoWindow().id+"_content")).html(a||"")},openWindow:function(c){var a=this.getInfoWindow();var b=this;PrimeFaces.ajax.Response.handle(c,null,null,{widget:a,handle:function(d){b.cfg.infoWindowContent=d;a.setContent('<div id="'+a.id+'_content">'+d+"</div>");a.open(b.getMap(),b.selectedOverlay)}});return true},configureMarkers:function(){var a=this;for(var c=0;c<this.cfg.markers.length;c++){var b=this.cfg.markers[c];b.setMap(this.map);if(this.cfg.fitBounds){this.extendView(b)}google.maps.event.addListener(b,"click",function(d){a.fireOverlaySelectEvent(d,this)});google.maps.event.addListener(b,"dragend",function(d){a.fireMarkerDragEvent(d,this)})}},fireMarkerDragEvent:function(c,a){if(this.hasBehavior("markerDrag")){var d=this.cfg.behaviors.markerDrag;var b={params:[{name:this.id+"_markerId",value:a.id},{name:this.id+"_lat",value:c.latLng.lat()},{name:this.id+"_lng",value:c.latLng.lng()}]};d.call(this,b)}},geocode:function(a){var e=this;if(this.hasBehavior("geocode")){var b=this.cfg.behaviors.geocode,d=new google.maps.Geocoder(),g=[],c=[],f=[];d.geocode({address:a},function(l,j){if(j==google.maps.GeocoderStatus.OK){for(var k=0;k<l.length;k++){var h=l[k].geometry.location;g.push(h.lat());c.push(h.lng());f.push(l[k].formatted_address)}if(l.length){var m={params:[{name:e.id+"_query",value:a},{name:e.id+"_addresses",value:f.join("_primefaces_")},{name:e.id+"_lat",value:g.join()},{name:e.id+"_lng",value:c.join()}]};b.call(this,m)}}else{PrimeFaces.error("Geocode was not found")}})}},reverseGeocode:function(e,b){var d=this;if(this.hasBehavior("reverseGeocode")){var a=this.cfg.behaviors.reverseGeocode,c=new google.maps.Geocoder(),g=new google.maps.LatLng(e,b),f=[];c.geocode({latLng:g},function(k,h){if(h==google.maps.GeocoderStatus.OK){for(var j=0;j<k.length;j++){if(k[j]){f[j]=k[j].formatted_address}}if(0<f.length){var l={params:[{name:d.id+"_address",value:f.join("_primefaces_")},{name:d.id+"_lat",value:e},{name:d.id+"_lng",value:b}]};a.call(this,l)}else{PrimeFaces.error("No results found")}}else{PrimeFaces.error("Geocoder failed")}})}},configurePolylines:function(){this.addOverlays(this.cfg.polylines)},configureCircles:function(){this.addOverlays(this.cfg.circles)},configureRectangles:function(){this.addOverlays(this.cfg.rectangles)},configurePolygons:function(){this.addOverlays(this.cfg.polygons)},fireOverlaySelectEvent:function(d,b){this.selectedOverlay=b;if(this.hasBehavior("overlaySelect")){var a=this.cfg.behaviors.overlaySelect;var c={params:[{name:this.id+"_overlayId",value:b.id}]};a.call(this,c)}},configureEventListeners:function(){var a=this;this.cfg.formId=$(PrimeFaces.escapeClientId(this.id)).parents("form:first").attr("id");if(this.cfg.onPointClick){google.maps.event.addListener(this.map,"click",function(b){a.cfg.onPointClick(b)})}this.configureStateChangeListener();this.configurePointSelectListener()},configureStateChangeListener:function(){var a=this,b=function(c){a.fireStateChangeEvent(c)};google.maps.event.addListener(this.map,"zoom_changed",b);google.maps.event.addListener(this.map,"dragend",b)},fireStateChangeEvent:function(d){if(this.hasBehavior("stateChange")){var a=this.cfg.behaviors.stateChange,c=this.map.getBounds();var b={params:[{name:this.id+"_northeast",value:c.getNorthEast().lat()+","+c.getNorthEast().lng()},{name:this.id+"_southwest",value:c.getSouthWest().lat()+","+c.getSouthWest().lng()},{name:this.id+"_center",value:c.getCenter().lat()+","+c.getCenter().lng()},{name:this.id+"_zoom",value:this.map.getZoom()}]};a.call(this,b)}},configurePointSelectListener:function(){var a=this;google.maps.event.addListener(this.map,"click",function(b){a.firePointSelectEvent(b)})},firePointSelectEvent:function(b){if(this.hasBehavior("pointSelect")){var c=this.cfg.behaviors.pointSelect;var a={params:[{name:this.id+"_pointLatLng",value:b.latLng.lat()+","+b.latLng.lng()}]};c.call(this,a)}},addOverlay:function(a){a.setMap(this.map)},addOverlays:function(b){var a=this;$.each(b,function(c,d){d.setMap(a.map);a.extendView(d);google.maps.event.addListener(d,"click",function(e){a.fireOverlaySelectEvent(e,d)})})},extendView:function(b){if(this.cfg.fitBounds&&b){var a=this;this.viewport=this.viewport||new google.maps.LatLngBounds();if(b instanceof google.maps.Marker){this.viewport.extend(b.getPosition())}else{if(b instanceof google.maps.Circle||b instanceof google.maps.Rectangle){this.viewport.union(b.getBounds())}else{if(b instanceof google.maps.Polyline||b instanceof google.maps.Polygon){b.getPath().forEach(function(d,c){a.viewport.extend(d)})}}}}},checkResize:function(){google.maps.event.trigger(this.map,"resize");this.map.setZoom(this.map.getZoom())}});