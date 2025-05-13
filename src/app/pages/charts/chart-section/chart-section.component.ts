import { Component } from '@angular/core';
import {HighchartsChartComponent, HighchartsChartModule} from "highcharts-angular";
//import type * as Highcharts from 'highcharts';
import Highcharts from 'highcharts';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SeriesForStackBar } from './chart-model';
//import Timeline from 'highcharts/modules/timeline';
//Timeline(Highcharts);


@Component({
  //standalone: false,
  selector: 'app-chart-section',
 imports: [HighchartsChartModule,FormsModule,CommonModule],
  templateUrl: './chart-section.component.html',
  styleUrl: './chart-section.component.css'
})
export class ChartSectionComponent {

staticData = [

	{
		"state":"Chhattisgarh",
		"district":"Patna",
		"block": "Block B",
		"village":"Village 2",
		"collection_date":	"2025-05-03",
		"milk_qty":	2500,
		"fat_per":5.29,
		"snf_per":8.71,
		"milk_type":"Buffalo",
		"source_centre":"BMC",
		"mcc_code":"CHHPAT6286",
		"lat":	24.965128,
		"long":	72.869284
	},
	{
		"state":"Chhattisgarh",
		"district":"Patna",
		"block": "Block B",
		"village":"Village 2",
		"collection_date":	"2025-05-03",
		"milk_qty":	2500,
		"fat_per":5.29,
		"snf_per":8.71,
		"milk_type":"Buffalo",
		"source_centre":"BMC",
		"mcc_code":"CHHPAT6286",
		"lat":	24.965128,
		"long":	72.869284
	},
  {
		"state":"Chhattisgarh",
		"district":"Patna",
		"block": "Block B",
		"village":"Village 2",
		"collection_date":	"2025-05-03",
		"milk_qty":	2500,
		"fat_per":5.29,
		"snf_per":8.71,
		"milk_type":"Buffalo",
		"source_centre":"BMC",
		"mcc_code":"CHHPAT6286",
		"lat":	24.965128,
		"long":	72.869284
	},
  {
		"state":"Bihar",
		"district":"Delhi",
		"block": "Block D",
		"village":"Village 2",
		"collection_date":	"2025-05-04",
		"milk_qty":	1734,
		"fat_per":3.76,
		"snf_per":9.43,
		"milk_type":"Cow",
		"source_centre":"BMC",
		"mcc_code":"BIHCHE3451",
		"lat":	22.577724,
		"long":	73.100274
	},
  {
		"state":"Bihar",
		"district":"Chennai",
		"block": "Block B",
		"village":"Village 1",
		"collection_date":	"2025-05-05",
		"milk_qty":	1364,
		"fat_per":3.76,
		"snf_per":9.43,
		"milk_type":"Cow",
		"source_centre":"BMC",
		"mcc_code":"BIHCHE3451",
		"lat":	22.577724,
		"long":	73.100274
	},
  {
		"state":"Bihar",
		"district":"Hyderabad",
		"block": "Block B",
		"village":"Village 4",
		"collection_date":	"2025-05-06",
		"milk_qty":	1790,
		"fat_per":3.98,
		"snf_per":7.76,
		"milk_type":"Buffalo",
		"source_centre":"MCU",
		"mcc_code":"BIHHYD3386",
		"lat":	23.588056,
		"long":	70.69067
	},
	{
		"state":"Andhra Pradesh",
		"district":"Patna",
		"block": "Block C",
		"village":"Village 3",
		"collection_date":	"2025-05-06",
		"milk_qty":	1077,
		"fat_per":5.24,
		"snf_per":8.45,
		"milk_type":"Cow",
		"source_centre":"MCC",
		"mcc_code":"ANDPAT3769",
		"lat":	23.721584,
		"long":	84.46514
	},
  {
		"state":"Chhattisgarh",
		"district":"Chennai",
		"block": "Block A",
		"village":"Village 1",
		"collection_date":	"2025-05-06",
		"milk_qty":	3375,
		"fat_per":3.91,
		"snf_per":8.14,
		"milk_type":"Buffalo",
		"source_centre":"MCU",
		"mcc_code":"CHHCHE3451",
		"lat":	23.525464,
		"long":	84.120139
	},
	{
		"state":"Goa",
		"district":"Chennai",
		"block": "Block B",
		"village":"Village 2",
		"collection_date":	"2025-05-07",
		"milk_qty":	1793,
		"fat_per":4.37,
		"snf_per":9.19,
		"milk_type":"Mixed",
		"source_centre":"MCU",
		"mcc_code":"GOACHE5998",
		"lat":	26.339829,
		"long":	75.046551
	},
	{
		"state":"Goa",
		"district":"Delhi",
		"block": "Block C",
		"village":"Village 1",
		"collection_date":	"2025-05-07",
		"milk_qty":	1486,
		"fat_per":5.13,
		"snf_per":8.71,
		"milk_type":"Buffalo",
		"source_centre":"MCU",
		"mcc_code":"GOADEL8742",
		"lat":	25.315423,
		"long":	79.425495
	},
	{
		"state":"Goa",
		"district":"Bhopal",
		"block": "Block B",
		"village":"Village 3",
		"collection_date":	"2025-05-08",
		"milk_qty":	3453,
		"fat_per":4.74,
		"snf_per":9.36,
		"milk_type":"Mixed",
		"source_centre":"MCU",
		"mcc_code":"GOABHO1755",
		"lat":	24.62518,
		"long":	75.718553
	},
	{
		"state":"Andhra Pradesh",
		"district":"Patna",
		"block": "Block A",
		"village":"Village 2",
		"collection_date":	"2025-05-08",
		"milk_qty":	1534,
		"fat_per":5.73,
		"snf_per":9.29,
		"milk_type":"Cow",
		"source_centre":"MCU",
		"mcc_code":"ANDPAT8662",
		"lat":	26.146336,
		"long":	76.17967
	},
	{
		"state":"Andhra Pradesh",
		"district":"Patna",
		"block": "Block A",
		"village":"Village 2",
		"collection_date":	"2025-05-08",
		"milk_qty":	1534,
		"fat_per":5.73,
		"snf_per":9.29,
		"milk_type":"Cow",
		"source_centre":"MCU",
		"mcc_code":"ANDPAT8662",
		"lat":	26.146336,
		"long":	76.17967
	},
	{
		"state":"Andhra Pradesh",
		"district":"Bhopal",
		"block": "Block B",
		"village":"Village 4",
		"collection_date":	"2025-05-08",
		"milk_qty":	2276,
		"fat_per":6.32,
		"snf_per":9.13,
		"milk_type":"Cow",
		"source_centre":"BMC",
		"mcc_code":"ANDBHO3833",
		"lat":	24.11345,
		"long":	87.354054
	},
	{
		"state":"Chhattisgarh",
		"district":"Hyderabad",
		"block": "Block B",
		"village":"Village 3",
		"collection_date":	"2025-05-09",
		"milk_qty":	1382,
		"fat_per":4.8,
		"snf_per":8.09,
		"milk_type":"Buffalo",
		"source_centre":"MCC",
		"mcc_code":"CHHHYD2406",
		"lat":	27.980244,
		"long":	72.759497
	}
];

filteredDataCategories:any=[];
filteredDataValues:any=[];

convertToCompatibleSeries:any=[];
stateFilter = ['Andhra Pradesh','Chhattisgarh','Bihar','Goa'];
districtFilter = ['Bhopal','Chennai','Delhi','Hyderabad','Patna'];
milkTypeFilter = ['Mixed','Buffalo','Cow'];
stateSelection:string = '';
districtSelection:string = '';
milkTypeSelection:string = '';

/**Stacked bar graph */
filteredDataCategoriesForStackedBarChart:any=[];
seriesForStackedBarChart:Array<SeriesForStackBar> = [];

/**Dual Axes Chart */
filteredDataCategoriesForDualAxesChart:any=[];
snfPercentData:any = [];
fatPercentData:any = [];

/**Pie Donut chart */
StateList:any=[];
milkQuantityByState:any=[];


ngOnInit(){
  //this.getLineChartByState("Bihar");
  this.getLineChartforAll();
  this.getStackedBarChart();
  this.getDualAxesChart();
  this.getPieDonutChart();
}

getLineChartforAll(){

  this.staticData.forEach(ele => {
   /* if(state==ele['state'])
    {*/
      let found = false;
      let index =0;

      for(let cat of this.filteredDataCategories)
      {
        if(cat==ele['collection_date'])
        {
          found = true;
          break;
        }
        index++;
      }

      if(found){
       // this.filteredDataCategories[index] = ele['collection_date'];
        this.filteredDataValues[index] = this.filteredDataValues[index]+
                                          ele['milk_qty'];
      }
      else{
        this.filteredDataCategories.push(ele['collection_date']);
        this.filteredDataValues.push( ele['milk_qty']);
      }
    //}

  });


  this.chartOptions  = {
    chart:{
      //type:'area'
      type:'line'
    },
    title:{
      //text:'Area Chart'
       text:'Daily Milk Collection'
    },
    xAxis:{
      categories:this.filteredDataCategories
    },
    yAxis:{
      title:{
        text:'Value'
      }
    },
    series:[{
      //type:'area',
       type:'line',
      name:'Daily Milk Collection',
      data:this.filteredDataValues,
      color:'#7cb5ec',
      //fillOpacity: 0.3
    }],
    credits:{
      enabled: false
    },
    plotOptions:{
      area:{
        marker:{
          enabled: false
        }
      }
    }
  }


}

getLineChartByState(state:any){
  this.filteredDataCategories = [];
  this.filteredDataValues = [];

  console.log("state: "+state.value);
  this.stateSelection = state.value;
  this.districtSelection= '';
  this.milkTypeSelection = '';

  if(this.stateSelection==''){
    this.getLineChartforAll();
  }
  else{
  this.staticData.forEach(ele => {
    if(this.stateSelection==ele['state'])
    {
      let found = false;
      let index =0;

      for(let cat of this.filteredDataCategories)
      {
        if(cat==ele['collection_date'])
        {
          found = true;
          break;
        }
        index++;
      }

      if(found){
       // this.filteredDataCategories[index] = ele['collection_date'];
        this.filteredDataValues[index] = this.filteredDataValues[index]+
                                          ele['milk_qty'];
      }
      else{
        this.filteredDataCategories.push(ele['collection_date']);
        this.filteredDataValues.push( ele['milk_qty']);
      }
    }

  });


  this.chartOptions  = {
    chart:{
      //type:'area'
      type:'line'
    },
    title:{
      //text:'Area Chart'
       text:'Daily Milk Collection'
    },
    xAxis:{
      categories:this.filteredDataCategories
    },
    yAxis:{
      title:{
        text:'Value'
      }
    },
    series:[{
      //type:'area',
       type:'line',
      name:this.stateSelection,
      data:this.filteredDataValues,
      color:'#7cb5ec',
      //fillOpacity: 0.3
    }],
    credits:{
      enabled: false
    },
    plotOptions:{
      area:{
        marker:{
          enabled: false
        }
      }
    }
  }

}
}

getLineChartByDistrict(district:any){
  this.filteredDataCategories = [];
  this.filteredDataValues = [];

  console.log("district: "+district.value);
  this.districtSelection = district.value;
  //selectedOptions[0].innerText
  this.stateSelection = '';
  this.milkTypeSelection = '';

  if(this.districtSelection==''){
    this.getLineChartforAll();
  }
  else{
  this.staticData.forEach(ele => {
    if(this.districtSelection==ele['district'])
    {
      let found = false;
      let index =0;

      for(let cat of this.filteredDataCategories)
      {
        if(cat==ele['collection_date'])
        {
          found = true;
          break;
        }
        index++;
      }

      if(found){
       // this.filteredDataCategories[index] = ele['collection_date'];
        this.filteredDataValues[index] = this.filteredDataValues[index]+
                                          ele['milk_qty'];
      }
      else{
        this.filteredDataCategories.push(ele['collection_date']);
        this.filteredDataValues.push( ele['milk_qty']);
      }
    }

  });


  this.chartOptions  = {
    chart:{
      //type:'area'
      type:'line'
    },
    title:{
      //text:'Area Chart'
       text:'Daily Milk Collection'
    },
    xAxis:{
      categories:this.filteredDataCategories
    },
    yAxis:{
      title:{
        text:'Value'
      }
    },
    series:[{
      //type:'area',
       type:'line',
      name:this.districtSelection,
      data:this.filteredDataValues,
      color:'#7cb5ec',
      //fillOpacity: 0.3
    }],
    credits:{
      enabled: false
    },
    plotOptions:{
      area:{
        marker:{
          enabled: false
        }
      }
    }
  }

}
}



getLineChartByMilkType(mt:any){
  this.filteredDataCategories = [];
  this.filteredDataValues = [];

  console.log("district: "+mt.value);
  this.milkTypeSelection = mt.value;
  this.stateSelection = '';
  this.districtSelection = '';

  if(this.milkTypeSelection==''){
    this.getLineChartforAll();
  }
  else{
  this.staticData.forEach(ele => {
    if(this.milkTypeSelection==ele['milk_type'])
    {
      let found = false;
      let index =0;

      for(let cat of this.filteredDataCategories)
      {
        if(cat==ele['collection_date'])
        {
          found = true;
          break;
        }
        index++;
      }

      if(found){
       // this.filteredDataCategories[index] = ele['collection_date'];
        this.filteredDataValues[index] = this.filteredDataValues[index]+
                                          ele['milk_qty'];
      }
      else{
        this.filteredDataCategories.push(ele['collection_date']);
        this.filteredDataValues.push( ele['milk_qty']);
      }
    }

  });


  this.chartOptions  = {
    chart:{
      //type:'area'
      type:'line'
    },
    title:{
      //text:'Area Chart'
       text:'Daily Milk Collection'
    },
    xAxis:{
      categories:this.filteredDataCategories
    },
    yAxis:{
      title:{
        text:'Value'
      }
    },
    series:[{
      //type:'area',
       type:'line',
      name:this.milkTypeSelection,
      data:this.filteredDataValues,
      color:'#7cb5ec',
      //fillOpacity: 0.3
    }],
    credits:{
      enabled: false
    },
    plotOptions:{
      area:{
        marker:{
          enabled: false
        }
      }
    }
  }

}
}



  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {
    chart:{
      //type:'area'
      type:'line'
    },
    title:{
      //text:'Area Chart'
       text:'Line Chart'
    },
    xAxis:{
      categories:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep',
        'Oct','Nov','Dec'
      ]
    },
    yAxis:{
      title:{
        text:'Value'
      }
    },
    series:[{
      //type:'area',
       type:'line',
      name:'Series 1',
      data:[1,2,3,4,5,6,7,8,9,10,11,12],
      color:'#7cb5ec',
      //fillOpacity: 0.3
    }],
    credits:{
      enabled: false
    },
    plotOptions:{
      area:{
        marker:{
          enabled: false
        }
      }
    }
  }

  chartOptionsPie:Highcharts.Options = {
    chart:{
      plotBackgroundColor:undefined,
      plotBorderWidth:undefined,
      plotShadow:false,
      type:'pie'
    },

    title:{
      text:'Browser Market Share 2023'
    },
    tooltip:{
      pointFormat:'{series.name}: <b>{point.percentage:.1f}%</b>'
    },
    accessibility:{
      point:{
        valueSuffix: '%'
      }
    },
    plotOptions:{
      pie:{
        allowPointSelect:true,
        cursor: 'pointer',
        dataLabels:{
          enabled: true,
          format: '<b>{point.name}</b>: {point.percentage:.1f}%'
        }
      }
    },
    series:[{
      name:'Browsers',
      type:'pie',
      data:[{
        name: 'chrome',
        y: 70.67,
        sliced:true,
        selected:true
      },{
        name:'Edge',
        y: 14.77
      },{
        name:'Firefox',
        y:4.86
      },{
        name:'Safari',
        y: 2.63
      },{
        name:'Internet Explorer',
        y:1.53
      },{
        name:'others',
        y:5.54
      }],
    }],
    credits:{
      enabled:false
    }
  }

  getStackedBarChart(){

    this.staticData.forEach(ele => {
      /* if(state==ele['state'])
       {*/
         let found = false;
         let index =0;


         for(let cat of this.filteredDataCategoriesForStackedBarChart)
         {
           if(cat==ele['collection_date'])
           {
             found = true;
             break;
           }
           index++;
         }

         if(found){
          // this.filteredDataCategories[index] = ele['collection_date'];
          let seriesFound = false;
           let indexj=0;
          for(let series of this.seriesForStackedBarChart)
            {
             if(series.name==ele['milk_type']){
               seriesFound = true;
               break;
             }
            }

            if(seriesFound)
            {
              let totalQty = this.seriesForStackedBarChart[indexj].data[index]+ele['milk_qty'];
             this.seriesForStackedBarChart[indexj].data[index]=totalQty;
            }
            else{
             this.seriesForStackedBarChart.push({
               name:ele['milk_type'],
               type:'bar',
               data: [ele['milk_qty']]
             });
            }
          //this.seriesForStackedBarChart.
          // this.filteredDataValues[index] = this.filteredDataValues[index]+
           //                                  ele['milk_qty'];
         }
         else{
           this.filteredDataCategoriesForStackedBarChart.push(ele['collection_date']);
           let seriesFound = false;
           let indexj=0;
           for(let series of this.seriesForStackedBarChart)
           {
            if(series.name==ele['milk_type']){
              seriesFound = true;
              break;
            }
           }

           if(seriesFound)
           {
            this.seriesForStackedBarChart[indexj].data.push(ele['milk_qty']);
           }
           else{
            this.seriesForStackedBarChart.push({
              name:ele['milk_type'],
              type:'bar',
              data: [ele['milk_qty']]
            });
           }

          // this.filteredDataValues.push( ele['milk_qty']);
         }
       //}

     });



     //options
     this.seriesForStackedBarChart.forEach(ele => {
      this.convertToCompatibleSeries.push(ele);
     })

     this.chartOptionsStackedBar = {
      chart: {
        type: 'bar'
      },
      title: {
        text: 'Cow Vs. Buffalo Vs. Mixed trends For Milk Type'
      },
      xAxis: {
        categories: this.filteredDataCategoriesForStackedBarChart
      },
      yAxis: {
        min: 0,
        title: {
          text: 'Total values'
        },
        stackLabels: {
          enabled: true,
          style: {
            fontWeight: 'bold',
            color: (Highcharts.defaultOptions.title?.style && Highcharts.defaultOptions.title?.style.color) || 'gray'
          }
        }
      },
      legend: {
        align: 'right',
        x: -30,
        verticalAlign: 'top',
        y: 25,
        floating: true,
        backgroundColor: Highcharts.defaultOptions.legend?.backgroundColor || 'white',
        borderColor: '#CCC',
        borderWidth: 1,
        shadow: false
      },
      tooltip: {
        headerFormat: '<b>{point.x}</b><br/>',
        pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
      },
      plotOptions: {
        bar: {
          stacking: 'normal',
          dataLabels: {
            enabled:true
          }
        },
        series:{
          stacking:'normal'
        }
      },
      credits:{
        enabled:false
      },
      series:this.convertToCompatibleSeries
  }



  }


  chartOptionsStackedBar: Highcharts.Options = {
    chart: {
      type: 'bar'
    },
    title: {
      text: 'Stacked Bar Chart Example'
    },
    xAxis: {
      categories: ['Category 1', 'Category 2', 'Category 3']
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Total values'
      },
      stackLabels: {
        enabled: true,
        style: {
          fontWeight: 'bold',
          color: (Highcharts.defaultOptions.title?.style && Highcharts.defaultOptions.title?.style.color) || 'gray'
        }
      }
    },
    legend: {
      align: 'right',
      x: -30,
      verticalAlign: 'top',
      y: 25,
      floating: true,
      backgroundColor: Highcharts.defaultOptions.legend?.backgroundColor || 'white',
      borderColor: '#CCC',
      borderWidth: 1,
      shadow: false
    },
    tooltip: {
      headerFormat: '<b>{point.x}</b><br/>',
      pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
    },
    plotOptions: {
      bar: {
        stacking: 'normal',
        dataLabels: {
          enabled:true
        }
      },
      series:{
        stacking:'normal'
      }
    },
    credits:{
      enabled:false
    },
    series:[

      {
      name:'Year 1800',
      type:'bar',
      data: [107, 31, 635, 203, 2]
    },
    {
       name: 'Year 1900',
       type:'bar',
       data: [133, 156, 947, 408, 6]
    },
    {
       name: 'Year 2008',
       type:'bar',
       data: [973, 914, 4054, 732, 34]
    }
 ]
}

getDualAxesChart(){

  this.staticData.forEach(ele => {
   /* if(this.milkTypeSelection==ele['milk_type'])
    {*/
      let found = false;
      let index =0;

      for(let cat of this.filteredDataCategoriesForDualAxesChart)
      {
        if(cat==ele['collection_date'])
        {
          found = true;
          break;
        }
        index++;
      }

      if(found){
       // this.filteredDataCategories[index] = ele['collection_date'];
        this.snfPercentData[index] = this.snfPercentData[index]+
                                          ele['snf_per'];
       this.fatPercentData[index] = this.fatPercentData[index]+
                                          ele['fat_per'];
      }
      else{
        this.filteredDataCategoriesForDualAxesChart.push(ele['collection_date']);
        this.snfPercentData.push( ele['snf_per']);
        this.fatPercentData.push(ele['fat_per']);
      }
    //}

  });



  this.chartOptionsDualAxes  = {
    chart : {
       //zoomType: 'xy',
       //zooming:'xy',
       type: 'xy'

    },
    title : {
       text: 'SNF% Vs. FAT%'
    },
    subtitle : {
       text: 'Comparison between SNF% and FAT% for daily milk collection'
    },
    xAxis : {
       categories: this.filteredDataCategoriesForDualAxesChart,
       crosshair: true
    },
    yAxis : [
       { // Primary yAxis
          labels: {
             format: '{value}%',
                style: {
                   color: "#FF41F8"
                   // Highcharts.getOptions().colors?.[1]
                }
          },
          title: {
             text: 'SNF%',
             style: {
                color:"#7702FF"
                //Highcharts.getOptions().colors?.[1]
             }
          }
       },
       { // Secondary yAxis
          title: {
             text: 'FAT%',
             style: {
                color: "#7cb5ec"
                // Highcharts.getOptions().colors?.[0]
             }
          },
          labels: {
             format: '{value}%',
             style: {
                color: "#F0060B"
                //Highcharts.getOptions().colors?.[0]
             }
          },
          opposite: true
       }
    ],
    tooltip: {
       shared: true
    },
    legend: {
       layout: 'vertical',
       align: 'left',
       x: 60,
       verticalAlign: 'top',
       y: 100,
       floating: true,

       backgroundColor: (
          Highcharts.theme && Highcharts.theme.legend?.backgroundColor)
          || '#FFFFFF'
    },
    series : [
       {
          name: 'FAT%',
         // type: 'column',
         type: 'spline',
          yAxis: 1,
          data: this.fatPercentData,
          tooltip: {
             valueSuffix: ' %'
          }
       },
       {
          name: 'SNF%',
          type: 'spline',
          data: this.snfPercentData,
          tooltip: {
             valueSuffix: '%'
          }
       }
    ]
  };


}

chartOptionsDualAxes: Highcharts.Options  = {
  chart : {
     //zoomType: 'xy',
     //zooming:'xy',
     type: 'xy'

  },
  title : {
     text: 'Source: WorldClimate.com'
  },
  subtitle : {
     text: 'Average Monthly Temperature and Rainfall in Tokyo'
  },
  xAxis : {
     categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
             'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
     crosshair: true
  },
  yAxis : [
     { // Primary yAxis
        labels: {
           format: '{value}\xB0C',
              style: {
                 color: "#FF41F8"
                 // Highcharts.getOptions().colors?.[1]
              }
        },
        title: {
           text: 'Temperature',
           style: {
              color:"#7702FF"
              //Highcharts.getOptions().colors?.[1]
           }
        }
     },
     { // Secondary yAxis
        title: {
           text: 'Rainfall',
           style: {
              color: "#7cb5ec"
              // Highcharts.getOptions().colors?.[0]
           }
        },
        labels: {
           format: '{value} mm',
           style: {
              color: "#F0060B"
              //Highcharts.getOptions().colors?.[0]
           }
        },
        opposite: true
     }
  ],
  tooltip: {
     shared: true
  },
  legend: {
     layout: 'vertical',
     align: 'left',
     x: 60,
     verticalAlign: 'top',
     y: 100,
     floating: true,

     backgroundColor: (
        Highcharts.theme && Highcharts.theme.legend?.backgroundColor)
        || '#FFFFFF'
  },
  series : [
     {
        name: 'Rainfall',
       // type: 'column',
       type: 'spline',
        yAxis: 1,
        data: [49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5,
                216.4, 194.1, 95.6, 54.4],
        tooltip: {
           valueSuffix: ' mm'
        }
     },
     {
        name: 'Temperature',
        type: 'spline',
        data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6],
        tooltip: {
           valueSuffix: '\xB0C'
        }
     }
  ]
};

getPieDonutChart(){

  let indexj=0;
  this.staticData.forEach(ele => {

  let found = false;
  let index =0;

  for(let state of this.StateList)
  {
    if(state==ele['state'])
    {
      found = true;
      break;
    }
    index++;
  }

  if(found){
   // this.filteredDataCategories[index] = ele['collection_date'];
   if(index!=0){
   this.milkQuantityByState[index][1]= this.milkQuantityByState[index][1]+
                                    ele['milk_qty']
   }
   else{
    this.milkQuantityByState[0].y= this.milkQuantityByState[0].y+
                                    ele['milk_qty'];
   }

  }
  else{
    this.StateList.push(ele['state']);
    if(indexj==0){
      this.milkQuantityByState.push({
        name:ele['state'] ,
        y:ele['milk_qty'],
        sliced: true,
        selected: true
     });
    }
    else{
    this.milkQuantityByState.push( [ele['state'],ele['milk_qty']]);
    }
  }
  indexj++;
//}

});

this.chartOptionsDonutChart = {
  chart : {
     plotBorderWidth: undefined,
     plotShadow: false
  },
  title : {
     text: 'State Wise contribution of Milk'
  },
  tooltip : {
     pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b><br><span>Total Quantity: </span><b>{point.y}</b>'
  },
  plotOptions : {
     pie: {
        shadow: false,
        center: ['50%', '50%'],
        size:'65%',
        innerSize: '40%'
     }
  },
  series : [{
     type: 'pie',
     name: 'Milk Contribution',
     data: this.milkQuantityByState
  }]
}


}

/**donut chart */
chartOptionsDonutChart:Highcharts.Options = {
  chart : {
     plotBorderWidth: undefined,
     plotShadow: false
  },
  title : {
     text: 'Browser market shares at a specific website, 2014'
  },
  tooltip : {
     pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
  },
  plotOptions : {
     pie: {
        shadow: false,
        center: ['50%', '50%'],
        size:'45%',
        innerSize: '20%'
     }
  },
  series : [{
     type: 'pie',
     name: 'Browser share',
     data: [
        ['Firefox',   45.0],
        ['IE',       26.8],
        {
           name: 'Chrome',
           y: 12.8,
           sliced: true,
           selected: true
        },
        ['Safari',    8.5],
        ['Opera',     6.2],
        ['Others',      0.7]
     ]
  }]
}


/**Timeline Charts */
/*chartOptionsTimeline:Highcharts.Options =
//Highcharts.chart('container',
  {
  chart: {
    type: 'xrange'
  },
  title: {
    text: 'Highcharts X-range'
  },
  xAxis: {
    type: 'datetime'
  },
  yAxis: {
    title: {
      text: ''
    },
    categories: ['Prototyping', 'Development', 'Testing'],
    reversed: true
  },
  plotOptions: {
    series: {
      dataLabels: {
        align: 'center',
        enabled: true,
        format: "{point.name}"
      }
    }
  },
  tooltip: {
    formatter: function() {
    console.log(this)
      //return this.point.name+' is in <b>'+this.yCategory+'</b><br>  from <b>' + Highcharts.dateFormat('%e %b %Y',
     return "this.point.name"+' is in <b>'+"this.yCategory"+'</b><br>  from <b>' + Highcharts.dateFormat('%e %b %Y',
          new Date().getTime()) +
          // new Date(this.x)) +
        ' to '+ Highcharts.dateFormat('%e %b %Y',
                                         // new Date(this.x2))+'</b> ';
                                         new Date().getTime())+'</b> ';
    }
  },
  series: [{
    type:'xrange',
    name: 'Project 1',
    pointWidth: 20,
    data: [{
      x: Date.UTC(2014, 10, 21),
      x2: Date.UTC(2014, 11, 1),
      y: 0,
      name: 'Proto1'
    }, {
      x: Date.UTC(2014, 11, 1),
      x2: Date.UTC(2014, 11, 5),
      y: 0,
      name: 'Proto2'
    }, {
      x: Date.UTC(2014, 11, 5),
      x2: Date.UTC(2014, 11, 10),
      y: 0,
      name: 'Proto3'
    }, {
      x: Date.UTC(2014, 10, 21),
      x2: Date.UTC(2014, 10, 25),
      y: 1,
      name: 'Dev1'
    }, {
      x: Date.UTC(2014, 10, 25),
      x2: Date.UTC(2014, 11, 5),
      y: 1,
      name: 'Dev2'
    }, {
      x: Date.UTC(2014, 11, 5),
      x2: Date.UTC(2014, 11, 10),
      y: 1,
       name: 'Dev3'
    }, {
      x: Date.UTC(2014, 10, 21),
      x2: Date.UTC(2014, 11, 1),
      y: 2,
      name: 'Test1'
    }, {
      x: Date.UTC(2014, 11, 1),
      x2: Date.UTC(2014, 11, 5),
      y: 2,
      name: 'Test2'
    }, {
      x: Date.UTC(2014, 11, 5),
      x2: Date.UTC(2014, 11, 10),
      y: 2,
      name: 'Test3'
    }, ],
    dataLabels: {
      enabled: true
    }
  }]

};
*/
/**Timeline2 */
/*chartOptionsTimeline2: Highcharts.Options = {
  chart: {
    type: 'timeline'
  },
  title: {
    text: 'Timeline Chart'
  },
  series: [{
    type:'timeline',
    data: [{
      name: 'Event 1',
      label: 'Label 1',
      description: 'Description 1'
    }, {
      name: 'Event 2',
      label: 'Label 2',
      description: 'Description 2'
    }]
  }]
};*/


  constructor(){

  }

  createAreaChart(){

  }
}
