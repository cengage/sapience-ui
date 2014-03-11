'use strict';

angular.module('sapience.system').controller('HomeController', ['$scope', '$http','Global', 
    function($scope, $http, Global) {
        $scope.global = Global;

    

    $http.get("http://localhost:3000/products")
    .success(function(data, status, headers, config) {
        $scope.applications = [];
        data.forEach(function(product,index,array){
          var product = {id:index,selected:false,name:product.name};
          $scope.applications.push(product);
        });
    }).error(function(data, status, headers, config) {
        $scope.status = status;
    });

    $http.get("http://localhost:3000/metrics")
    .success(function(data, status, headers, config) {
        $scope.loadMetrics(data);
    }).error(function(data, status, headers, config) {
        $scope.status = status;
    });
		   
  $scope.spiderChartModel = {};
  $scope.lineChartModel = {};
  $scope.spiderChartModel.expectedSeries = {name:'Expected',data: []};
  $scope.lineChartModel.expectedSeries = {name:'Expected',data: []};
  
  $scope.spiderApplicationSeries = [];
  $scope.lineApplicationSeries = []; 




  $scope.applicationToggled = function(application){
	application.selected = !application.selected;

	if(application.selected){
    var randomColor = "#"+((1<<24)*Math.random()|0).toString(16);
		$scope.spiderApplicationSeries.push({name:application.name, data: $scope.metricData[application.name],color:randomColor});		
		$scope.lineApplicationSeries.push({name:application.name, data: $scope.metricData[application.name],color:randomColor});		
	}else{
		var applicationToPop = $.grep($scope.spiderApplicationSeries, function(e){ return e.name == application.name; });
		$scope.spiderApplicationSeries.pop(applicationToPop);
		$scope.lineApplicationSeries.pop(applicationToPop);
	}
  
  $scope.spiderChartModel.applicationSeries = $scope.spiderApplicationSeries;
  $scope.lineChartModel.applicationSeries = $scope.lineApplicationSeries;
	$scope.buildSpiderChart($scope.spiderChartModel);
	$scope.buildLineChart($scope.lineChartModel);
  };

  $scope.loadMetrics = function(metrics){
      $scope.metricData = {};
      $scope.spiderChartModel.categories = [];
      $scope.lineChartModel.categories = [];
      metrics.forEach(function(metric,index,array){
          $scope.spiderChartModel.categories.push(metric.category.name);
          $scope.lineChartModel.categories.push(metric.category.name);
          if(metric.product.name in $scope.metricData){
            $scope.metricData[metric.product.name] = $scope.metricData[metric.product.name].concat([metric.value]);
          }else{
            $scope.metricData[metric.product.name] = [metric.value];
          }
          
        });
  };

  $scope.buildLineChart = function(lineChartModel){
	new Highcharts.Chart({
			chart: {
			renderTo: 'lineChart',
	        type: 'line'
			},
            title: {
                text: 'Quality Metrics',
                x: -20 //center
            },
            subtitle: {
                x: -20
            },
            xAxis: {
                categories: lineChartModel.categories
            },
            yAxis: {
                title: {
                    text: 'Count'
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            tooltip: {
                valueSuffix: ''
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle',
                borderWidth: 0
            },
            series: [lineChartModel.expectedSeries].concat(lineChartModel.applicationSeries)
        });
	};
  
  $scope.buildSpiderChart = function(spiderChartModel){
	
	new Highcharts.Chart({
        chart: {
			renderTo: 'spiderChart',
	        polar: true,
	        type: 'line'
	    },
	    
	    title: {
	        text: 'Quality Metrics',
          x: -50,
          y: 50
	    },
	    
	    xAxis: {
	        categories: spiderChartModel.categories,
	        tickmarkPlacement: 'on',
	        lineWidth: 0
	    },
	        
	    yAxis: {
	        gridLineInterpolation: 'polygon',
	        lineWidth: 0,
	        min: 0
	    },
	    
	    tooltip: {
	    	shared: true,
	        pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y:,.0f}</b><br/>'
	    },
	    
	    legend: {
	        align: 'right',
	        verticalAlign: 'top',
	        y: 70,
	        layout: 'vertical'
	    },
	    
	    series: [spiderChartModel.expectedSeries].concat(spiderChartModel.applicationSeries)		
      });
	}
    }
]);
