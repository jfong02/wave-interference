// Copyright 2017-2019, University of Colorado Boulder

/**
 * Shows the Diffraction Screen
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const Circle = require( 'SCENERY/nodes/Circle' );
  const DiffractionModel = require( 'WAVE_INTERFERENCE/diffraction/model/DiffractionModel' );
  const Dimension2 = require( 'DOT/Dimension2' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const LaserPointerNode = require( 'SCENERY_PHET/LaserPointerNode' );
  const LengthScaleIndicatorNode = require( 'WAVE_INTERFERENCE/common/view/LengthScaleIndicatorNode' );
  const Matrix3 = require( 'DOT/Matrix3' );
  const MatrixCanvasNode = require( 'WAVE_INTERFERENCE/diffraction/view/MatrixCanvasNode' );
  const NumberControl = require( 'SCENERY_PHET/NumberControl' );
  const Panel = require( 'SUN/Panel' );
  const RadioButtonGroup = require( 'SUN/buttons/RadioButtonGroup' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  const ScreenView = require( 'JOIST/ScreenView' );
  const VBox = require( 'SCENERY/nodes/VBox' );
  const VisibleColor = require( 'SCENERY_PHET/VisibleColor' );
  const waveInterference = require( 'WAVE_INTERFERENCE/waveInterference' );
  const WaveInterferenceConstants = require( 'WAVE_INTERFERENCE/common/WaveInterferenceConstants' );
  const WaveInterferenceText = require( 'WAVE_INTERFERENCE/common/view/WaveInterferenceText' );
  const WavelengthSlider = require( 'SCENERY_PHET/WavelengthSlider' );

  // constants
  const ICON_SCALE = 0.2;
  const NUMBER_CONTROL_OPTIONS = WaveInterferenceConstants.NUMBER_CONTROL_OPTIONS;
  const BOX_SPACING = 15;
  const BOTTOM_MARGIN = 10;

  const PANEL_OPTIONS = {
    xMargin: 10,
    yMargin: 10,
    cornerRadius: 5,
    fill: '#e2e3e5'
  };

  class DiffractionScreenView extends ScreenView {

    /**
     * @param {DiffractionModel} model
     */
    constructor( model ) {
      super();

      // @private
      this.model = model;

      const laserPointerNode = new LaserPointerNode( model.onProperty, {
        left: 10,
        centerY: 50,
        bodySize: new Dimension2( 110 * 0.8, 78 * 0.8 ),
        nozzleSize: new Dimension2( 20 * 0.8, 60 * 0.8 )
      } );

      // Reset All button
      const resetAllButton = new ResetAllButton( {
        listener: () => model.reset(),
        right: this.layoutBounds.maxX - 10,
        bottom: this.layoutBounds.maxY - BOTTOM_MARGIN
      } );
      this.addChild( resetAllButton );

      const sceneRadioButtonContent = [ {
        value: model.ellipseScene,
        node: new Circle( 10, { fill: 'black' } )
      }, {
        value: model.rectangleScene,
        node: new Rectangle( 0, 0, 20, 20, { fill: 'black' } )
      }
        // , {
        //   value: 'test',
        //   node: new Rectangle( 0, 0, 20, 20, { fill: 'black' } )
        // }, {
        //   value: 'test2',
        //   node: new Rectangle( 0, 0, 20, 20, { fill: 'black' } )
        // }, {
        //   value: 'test3',
        //   node: new Rectangle( 0, 0, 20, 20, { fill: 'black' } )
        // }
      ];

      const MATRIX_CANVAS_NODE_SCALE = 1.4/2;
      this.apertureNode = new MatrixCanvasNode( model.apertureMatrix, { scale: MATRIX_CANVAS_NODE_SCALE } );
      this.apertureNode.top = 120;
      this.addChild( this.apertureNode );

      this.diffractionNode = new MatrixCanvasNode( model.diffractionMatrix, { scale: MATRIX_CANVAS_NODE_SCALE } );
      this.diffractionNode.right = this.layoutBounds.right - 20;
      this.diffractionNode.top = this.apertureNode.top;
      model.wavelengthProperty.link( wavelength => this.diffractionNode.setBaseColor( VisibleColor.wavelengthToColor( wavelength ) ) );
      this.addChild( this.diffractionNode );

      this.apertureNode.right = this.diffractionNode.left - 50;

      const lengthScaleIndicatorNode = new LengthScaleIndicatorNode( 45, '1000 nm', {
        leftBottom: this.apertureNode.leftTop.plusXY( 0, -5 )
      } );
      this.addChild( lengthScaleIndicatorNode );

      const sceneRadioButtonGroup = new RadioButtonGroup( model.sceneProperty, sceneRadioButtonContent, {
        right: this.apertureNode.left - 20,
        bottom: this.apertureNode.bottom
      } );

      this.miniApertureNode = new MatrixCanvasNode( model.apertureMatrix, {
        scale: ICON_SCALE,
        centerY: laserPointerNode.centerY,
        centerX: this.apertureNode.centerX,
        matrix: Matrix3.affine( 1, 0, 0, 0.25, 1, 0 )
      } );

      this.miniDiffractionNode = new MatrixCanvasNode( model.diffractionMatrix, {
        scale: ICON_SCALE,
        centerY: laserPointerNode.centerY,
        centerX: this.diffractionNode.centerX,
        matrix: Matrix3.affine( 1, 0, 0, 0.25, 1, 0 )
      } );
      model.wavelengthProperty.link( wavelength => this.miniDiffractionNode.setBaseColor( VisibleColor.wavelengthToColor( wavelength ) ) );

      const updateCanvases = this.updateCanvases.bind( this );

      model.sceneProperty.lazyLink( updateCanvases );

      this.addChild( sceneRadioButtonGroup );
      model.scenes.forEach( scene => scene.link( updateCanvases ) );
      model.onProperty.lazyLink( updateCanvases );
      model.numberOfLinesProperty.lazyLink( updateCanvases );
      model.angleProperty.lazyLink( updateCanvases );

      const aperturePanelOptions = _.extend( {
        centerX: this.apertureNode.centerX,
        bottom: this.layoutBounds.bottom - BOTTOM_MARGIN
      }, PANEL_OPTIONS );
      this.rectangleSceneControlPanel = new Panel( new HBox( {
        spacing: BOX_SPACING,
        children: [
          new NumberControl( 'columnRadius', model.rectangleScene.columnRadiusProperty, model.rectangleScene.columnRadiusProperty.range, _.extend( {
            // delta: 2 // avoid odd/even artifacts
          }, NUMBER_CONTROL_OPTIONS ) ),
          new NumberControl( 'rowRadius', model.rectangleScene.rowRadiusProperty, model.rectangleScene.rowRadiusProperty.range, _.extend( {
            // delta: 2 // avoid odd/even artifacts
          }, NUMBER_CONTROL_OPTIONS ) ) ]
      } ), aperturePanelOptions );
      this.addChild( this.rectangleSceneControlPanel );

      this.ellipseSceneControlPanel = new Panel( new HBox( {
        spacing: BOX_SPACING,
        children: [
          new NumberControl( 'Diameter', model.ellipseScene.diameterProperty, model.ellipseScene.diameterProperty.range, _.extend( {
            sliderOptions: {
              majorTicks: [ {

                // TODO: model coordinates for these
                value: model.ellipseScene.diameterProperty.range.min,
                label: new WaveInterferenceText( model.ellipseScene.diameterProperty.range.min )
              }, {
                value: model.ellipseScene.diameterProperty.range.max,
                label: new WaveInterferenceText( model.ellipseScene.diameterProperty.range.max )
              } ]
            }
          }, NUMBER_CONTROL_OPTIONS ) ),
          new NumberControl( 'Eccentricity', model.ellipseScene.eccentricityProperty, model.ellipseScene.eccentricityProperty.range, _.extend( {
            delta: 0.01,
            sliderOptions: {
              majorTicks: [ {

                // TODO: model coordinates for these
                value: model.ellipseScene.eccentricityProperty.range.min,
                label: new WaveInterferenceText( model.ellipseScene.eccentricityProperty.range.min )
              }, {
                value: model.ellipseScene.eccentricityProperty.range.max,
                label: new WaveInterferenceText( model.ellipseScene.eccentricityProperty.range.max )
              } ]
            }
          }, NUMBER_CONTROL_OPTIONS ) )
        ]
      } ), aperturePanelOptions );
      this.addChild( this.ellipseSceneControlPanel );

      this.slitsControlPanel = new Panel( new VBox( {
        spacing: BOX_SPACING,
        children: [
          new NumberControl( 'number lines', model.numberOfLinesProperty, model.numberOfLinesProperty.range, NUMBER_CONTROL_OPTIONS ),
          new NumberControl( 'angle', model.angleProperty, model.angleProperty.range, _.extend( {
            delta: 0.01
          }, NUMBER_CONTROL_OPTIONS ) )
        ]
      } ), _.extend( {
        leftTop: this.apertureNode.leftBottom.plusXY( 0, 5 )
      }, aperturePanelOptions ) );
      this.addChild( this.slitsControlPanel );

      // TODO: Use togglenode?
      model.sceneProperty.link( scene => {
        this.rectangleSceneControlPanel.visible = scene === model.rectangleScene;
        this.ellipseSceneControlPanel.visible = scene === model.ellipseScene;
        this.slitsControlPanel.visible = scene === DiffractionModel.ApertureType.SLITS;
      } );

      const beamWidth = 40;
      const incidentBeam = new Rectangle(
        laserPointerNode.right, laserPointerNode.centerY - beamWidth / 2,
        this.miniApertureNode.centerX - laserPointerNode.right, beamWidth, {
          opacity: 0.7
        } );

      model.wavelengthProperty.link( wavelength => incidentBeam.setFill( VisibleColor.wavelengthToColor( wavelength ) ) );

      // support for larger canvas for generating rasters
      const transmittedBeam = new Rectangle(
        this.miniApertureNode.centerX,
        laserPointerNode.centerY - beamWidth / 2,
        Math.max( this.miniDiffractionNode.centerX - this.miniApertureNode.centerX, 0 ),
        beamWidth, {
          opacity: 0.7
        } );
      model.wavelengthProperty.link( wavelength => transmittedBeam.setFill( VisibleColor.wavelengthToColor( wavelength ) ) );

      model.onProperty.linkAttribute( incidentBeam, 'visible' );
      model.onProperty.linkAttribute( transmittedBeam, 'visible' );

      const wavelengthSlider = new Panel( new VBox( {
        children: [
          new WaveInterferenceText( 'Wavelength' ), // TODO: i18n
          new WavelengthSlider( model.wavelengthProperty, {
            trackWidth: 100,
            trackHeight: 30,

            // thumb
            thumbWidth: 25,
            thumbHeight: 25,

            valueFont: WaveInterferenceConstants.DEFAULT_FONT
          } )
        ]
      } ), _.extend( {
        left: 5,
        top: laserPointerNode.bottom + 10
      }, PANEL_OPTIONS ) );

      this.addChild( transmittedBeam );
      this.addChild( this.miniApertureNode );
      this.addChild( incidentBeam );
      this.addChild( this.miniDiffractionNode );
      this.addChild( laserPointerNode );
      this.addChild( wavelengthSlider );

      updateCanvases();
    }

    updateCanvases() {
      this.apertureNode.invalidatePaint();
      this.miniApertureNode.invalidatePaint();
      this.diffractionNode.invalidatePaint();
      this.miniDiffractionNode.invalidatePaint();
    }
  }

  return waveInterference.register( 'DiffractionScreenView', DiffractionScreenView );
} );