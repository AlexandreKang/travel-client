import {
  Component,
  NgZone,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  OnInit,
} from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4maps from '@amcharts/amcharts4/maps';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import am4themes_dark from '@amcharts/amcharts4/themes/dark';
import am4geodata_worldHigh from '@amcharts/amcharts4-geodata/worldHigh';
import am4geodata_usaHigh from '@amcharts/amcharts4-geodata/usaHigh';
import am4geodata_canadaHigh from '@amcharts/amcharts4-geodata/canadaHigh';
import { CityService } from '../../service/city.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements OnInit, OnDestroy, AfterViewInit {
  originCity: any[] = [];
  destinationCity: any[] = [];
  originCityForm: FormGroup;
  destinationCityForm: FormGroup;

  @ViewChild('chart', { static: true })
  private chart: am4maps.MapChart;
  private originImageSeries;
  private originImageTemplate;
  private destinationImageSeries;
  private destinationImageTemplate;
  constructor(
    private zone: NgZone,
    private fb: FormBuilder,
    private service: CityService
  ) {}

  ngOnInit() {
    this.originCityForm = this.fb.group({
      origin: ['', [Validators.required, Validators.pattern('[a-zA-Z ]*')]],
    });
    this.destinationCityForm = this.fb.group({
      destination: [
        '',
        [Validators.required, Validators.pattern('[a-zA-Z ]*')],
      ],
    });
  }

  getOriginCity(originCityForm: FormGroup) {
    this.service.getCity(originCityForm.value.origin).subscribe((city) => {
      this.originCity.push(city);
      this.originImageSeries.data = this.originCity;
    });
    originCityForm.reset();
    this.originCity.pop();
  }

  getDestinationCity(destinationCityForm: FormGroup) {
    this.service
      .getCity(destinationCityForm.value.destination)
      .subscribe((city) => {
        this.destinationCity.push(city);
        this.destinationImageSeries.data = this.destinationCity;
      });
    destinationCityForm.reset();
  }

  ngAfterViewInit() {
    this.zone.runOutsideAngular(() => {
      /* Chart code */
      // Themes begin
      am4core.useTheme(am4themes_dark);
      am4core.useTheme(am4themes_animated);
      // Themes end

      // Create map instance
      const chart = am4core.create('chartdiv', am4maps.MapChart);
      // Set map definition
      chart.geodata = am4geodata_worldHigh;

      // Set projection
      chart.projection = new am4maps.projections.Miller();

      // Create map polygon series
      const polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
      const usaSeries = chart.series.push(new am4maps.MapPolygonSeries());
      const canadaSeries = chart.series.push(new am4maps.MapPolygonSeries());

      // Make map load polygon (like country names) data from GeoJSON
      polygonSeries.useGeodata = true;
      polygonSeries.exclude = ['AQ'];
      usaSeries.geodata = am4geodata_usaHigh;
      usaSeries.useGeodata = true;
      canadaSeries.geodata = am4geodata_canadaHigh;
      canadaSeries.useGeodata = true;

      // Configure series
      const polygonTemplate = polygonSeries.mapPolygons.template;
      polygonTemplate.tooltipText = '{name}';
      polygonTemplate.fill = am4core.color('#61605f');
      polygonTemplate.events.on('hit', (ev) => {
        ev.target.series.chart.zoomToMapObject(ev.target);
      });

      const usaTemplate = usaSeries.mapPolygons.template;
      usaTemplate.tooltipText = '{name}';
      usaTemplate.fill = am4core.color('#61605f');
      usaTemplate.events.on('hit', (ev) => {
        ev.target.series.chart.zoomToMapObject(ev.target);
      });

      const canadaTemplate = canadaSeries.mapPolygons.template;
      canadaTemplate.tooltipText = '{name}';
      canadaTemplate.fill = am4core.color('#61605f');
      canadaTemplate.events.on('hit', (ev) => {
        ev.target.series.chart.zoomToMapObject(ev.target);
      });

      const hs = polygonTemplate.states.create('hover');
      hs.properties.fill = am4core.color('#6037f5');
      const hus = usaTemplate.states.create('hover');
      hus.properties.fill = am4core.color('#6037f5');
      const hcan = canadaTemplate.states.create('hover');
      hcan.properties.fill = am4core.color('#6037f5');

      // Export
      chart.exporting.menu = new am4core.ExportMenu();

      // Zoom control
      chart.zoomControl = new am4maps.ZoomControl();
      chart.zoomControl.slider.height = 100;

      const homeButton = new am4core.Button();
      homeButton.events.on('hit', (event) => {
        chart.goHome();
      });
      homeButton.icon = new am4core.Sprite();
      homeButton.padding(7, 5, 7, 5);
      homeButton.width = 30;
      homeButton.icon.path =
        'M16,8 L14,8 L14,16 L10,16 L10,10 L6,10 L6,16 L2,16 L2,8 L0,8 L8,0 L16,8 Z M16,8';
      homeButton.marginBottom = 10;
      homeButton.parent = chart.zoomControl;
      homeButton.insertBefore(chart.zoomControl.plusButton);

      // Default to London view
      // chart.homeGeoPoint = { "longitude": originCities[0].zoomLongitude, "latitude": originCities[0].zoomLatitude };
      // chart.homeZoomLevel = originCities[0].zoomLevel;

      const targetSVG =
        'M9,0C4.029,0,0,4.029,0,9s4.029,9,9,9s9-4.029,9-9S13.971,0,9,0z M9,15.93 c-3.83,0-6.93-3.1-6.93-6.93S5.17,' +
        '2.07,9,2.07s6.93,3.1,6.93,6.93S12.83,15.93,9,15.93 M12.5,9c0,1.933-1.567,3.5-3.5,3.5S5.5,10.933,5.5,9S7.067,' +
        '5.5,9,5.5 S12.5,7.067,12.5,9z';
      const planeSVG =
        'm2,106h28l24,30h72l-44,-133h35l80,132h98c21,0 21,34 0,34l-98,0 -80,134h-35l43,-133h-71l-24,30h-28l15,-47';

      // Texts
      const labelsContainer = chart.createChild(am4core.Container);
      labelsContainer.isMeasured = false;
      labelsContainer.x = 80;
      labelsContainer.y = 27;
      labelsContainer.layout = 'horizontal';
      labelsContainer.zIndex = 10;

      const plane = labelsContainer.createChild(am4core.Sprite);
      plane.scale = 0.15;
      plane.path = planeSVG;
      plane.fill = am4core.color('#cc0000');

      const title = labelsContainer.createChild(am4core.Label);
      title.text = 'Flights from London';
      title.fill = am4core.color('#cc0000');
      title.fontSize = 20;
      title.valign = 'middle';
      title.dy = 2;
      title.marginLeft = 15;

      // Origin series (big targets, London and Vilnius)
      this.originImageSeries = chart.series.push(new am4maps.MapImageSeries());
      this.originImageTemplate = this.originImageSeries.mapImages.template;

      this.originImageTemplate.propertyFields.latitude = 'latitude';
      this.originImageTemplate.propertyFields.longitude = 'longitude';
      this.originImageTemplate.propertyFields.id = 'id';

      this.originImageTemplate.cursorOverStyle =
        am4core.MouseCursorStyle.pointer;
      this.originImageTemplate.nonScaling = true;
      this.originImageTemplate.tooltipText = '{title}';

      this.originImageTemplate.setStateOnChildren = true;
      this.originImageTemplate.states.create('hover');

      this.originImageTemplate.horizontalCenter = 'middle';
      this.originImageTemplate.verticalCenter = 'middle';

      const interfaceColors = new am4core.InterfaceColorSet();

      const originHitCircle = this.originImageTemplate.createChild(
        am4core.Circle
      );
      originHitCircle.radius = 11;
      originHitCircle.fill = interfaceColors.getFor('background');

      const originTargetIcon = this.originImageTemplate.createChild(
        am4core.Sprite
      );
      originTargetIcon.fill = interfaceColors.getFor('alternativeBackground');
      originTargetIcon.strokeWidth = 0;
      originTargetIcon.scale = 1.3;
      originTargetIcon.horizontalCenter = 'middle';
      originTargetIcon.verticalCenter = 'middle';
      originTargetIcon.path = targetSVG;

      const originHoverState = originTargetIcon.states.create('hover');
      originHoverState.properties.fill = chart.colors.getIndex(1);

      // when hit on city, change lines
      this.originImageTemplate.events.on(
        'hit',
        (event) => {
          showLines(event.target.dataItem);
        },
        this
      );

      // destination series (small targets)
      this.destinationImageSeries = chart.series.push(
        new am4maps.MapImageSeries()
      );
      this.destinationImageTemplate = this.destinationImageSeries.mapImages.template;

      this.destinationImageTemplate.nonScaling = true;
      this.destinationImageTemplate.tooltipText = '{title}';
      this.destinationImageTemplate.fill = interfaceColors.getFor(
        'alternativeBackground'
      );
      this.destinationImageTemplate.setStateOnChildren = true;
      this.destinationImageTemplate.states.create('hover');

      this.destinationImageTemplate.propertyFields.latitude = 'latitude';
      this.destinationImageTemplate.propertyFields.longitude = 'longitude';
      this.destinationImageTemplate.propertyFields.id = 'id';

      const destinationHitCircle = this.destinationImageTemplate.createChild(
        am4core.Circle
      );
      destinationHitCircle.radius = 7;
      destinationHitCircle.fillOpacity = 1;
      destinationHitCircle.fill = interfaceColors.getFor('background');

      const destinationTargetIcon = this.destinationImageTemplate.createChild(
        am4core.Sprite
      );
      destinationTargetIcon.scale = 0.7;
      destinationTargetIcon.path = targetSVG;
      destinationTargetIcon.horizontalCenter = 'middle';
      destinationTargetIcon.verticalCenter = 'middle';

      const changeLink = chart.createChild(am4core.TextLink);
      changeLink.text = 'Click to change origin city';
      changeLink.isMeasured = false;

      /* changeLink.events.on('hit', (event) => {
        const n = Math.floor(Math.random() * originCities.length);
        showLines(originImageSeries.dataItems.getIndex(n));
      }, this); */

      changeLink.x = 142;
      changeLink.y = 72;
      changeLink.fontSize = 13;

      // Line series
      const lineSeries = chart.series.push(new am4maps.MapLineSeries());
      lineSeries.mapLines.template.line.strokeOpacity = 0.5;
      lineSeries.mapLines.template.shortestDistance = false;
      chart.events.on(
        'ready',
        (event) => {
          showLines(this.originImageSeries.dataItems.getIndex(0));
        },
        this
      );

      let currentOrigin: any;

      function showLines(origin: any) {
        const dataContext = origin.dataContext;
        const destinations = dataContext.destinations;
        // clear old
        lineSeries.mapLines.clear();
        currentOrigin = origin;

        if (destinations) {
          for (const destination of destinations) {
            const line = lineSeries.mapLines.create();
            line.imagesToConnect = [origin.mapImage.id, destination];
          }
        }

        title.text = 'Flights from ' + dataContext.title;

        chart.zoomToGeoPoint(
          {
            latitude: dataContext.zoomLatitude,
            longitude: dataContext.zoomLongitude,
          },
          dataContext.zoomLevel,
          true
        );
      }
      this.chart = chart;
    });
  }

  ngOnDestroy() {
    this.zone.runOutsideAngular(() => {
      if (this.chart) {
        this.chart.dispose();
      }
    });
  }
}
