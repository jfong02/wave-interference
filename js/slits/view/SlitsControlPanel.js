// Copyright 2018, University of Colorado Boulder

/**
 * Controls for the barrier/slits.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var BarrierTypeEnum = require( 'WAVE_INTERFERENCE/slits/model/BarrierTypeEnum' );
  var ComboBox = require( 'SUN/ComboBox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var NumberControl = require( 'SCENERY_PHET/NumberControl' );
  var Range = require( 'DOT/Range' );
  var ToggleNode = require( 'SUN/ToggleNode' );
  var waveInterference = require( 'WAVE_INTERFERENCE/waveInterference' );
  var WaveInterferenceConstants = require( 'WAVE_INTERFERENCE/common/WaveInterferenceConstants' );
  var WaveInterferencePanel = require( 'WAVE_INTERFERENCE/common/view/WaveInterferencePanel' );
  var WaveInterferenceText = require( 'WAVE_INTERFERENCE/common/view/WaveInterferenceText' );

  // strings
  var noBarrierString = require( 'string!WAVE_INTERFERENCE/noBarrier' );
  var oneSlitString = require( 'string!WAVE_INTERFERENCE/oneSlit' );
  var slitSeparationString = require( 'string!WAVE_INTERFERENCE/slitSeparation' );
  var slitWidthString = require( 'string!WAVE_INTERFERENCE/slitWidth' );
  var twoSlitsString = require( 'string!WAVE_INTERFERENCE/twoSlits' );
  var cmValueString = require( 'string!WAVE_INTERFERENCE/cmValue' );
  var nmValueString = require( 'string!WAVE_INTERFERENCE/nmValue' );

  /**
   * @param {AlignGroup} alignGroup
   * @param {SlitsScreenModel} model
   * @param {Node} comboBoxParent
   * @param {Object} [options]
   * @constructor
   */
  function SlitsControlPanel( alignGroup, model, comboBoxParent, options ) {

    var comboBox = new ComboBox( [
      ComboBox.createItem( new WaveInterferenceText( noBarrierString ), BarrierTypeEnum.NO_BARRIER ),
      ComboBox.createItem( new WaveInterferenceText( oneSlitString ), BarrierTypeEnum.ONE_SLIT ),
      ComboBox.createItem( new WaveInterferenceText( twoSlitsString ), BarrierTypeEnum.TWO_SLITS )
    ], model.barrierTypeProperty, comboBoxParent, {
      buttonYMargin: 0
    } );

    // TODO: these controls need to respect the scene--units, ranges, etc.
    var createLabel = function( text ) {
      return new WaveInterferenceText( text, { fontSize: 10 } );
    };
    var waterSlitWidthControl = new NumberControl( slitWidthString, model.waterScene.slitWidthProperty, new Range( 0, 5 ), _.extend( {
      valuePattern: cmValueString,
      majorTicks: [
        { value: 0, label: createLabel( '0 cm' ) },
        { value: 5, label: createLabel( '5 cm' ) } ]
    }, WaveInterferenceConstants.NUMBER_CONTROL_OPTIONS ) );
    var soundSlitWidthControl = new NumberControl( slitWidthString, model.soundScene.slitWidthProperty, new Range( 0, 50 ), _.extend( {
      valuePattern: cmValueString,
      majorTicks: [
        { value: 0, label: createLabel( '0 cm' ) },
        { value: 50, label: createLabel( '50 cm' ) } ]
    }, WaveInterferenceConstants.NUMBER_CONTROL_OPTIONS ) );
    var lightSlitWidthControl = new NumberControl( slitWidthString, model.lightScene.slitWidthProperty, new Range( 0, 2000 ), _.extend( {
      valuePattern: nmValueString,
      majorTicks: [
        { value: 0, label: createLabel( '0 nm' ) },
        { value: 2000, label: createLabel( '2000 nm' ) } ]
    }, WaveInterferenceConstants.NUMBER_CONTROL_OPTIONS ) );
    var slitWidthControl = new ToggleNode( [
      { value: model.waterScene, node: waterSlitWidthControl },
      { value: model.soundScene, node: soundSlitWidthControl },
      { value: model.lightScene, node: lightSlitWidthControl }
    ], model.sceneProperty );
    model.barrierTypeProperty.link( function( barrierType ) {
      waterSlitWidthControl.enabled = barrierType === BarrierTypeEnum.ONE_SLIT || barrierType === BarrierTypeEnum.TWO_SLITS;
      soundSlitWidthControl.enabled = barrierType === BarrierTypeEnum.ONE_SLIT || barrierType === BarrierTypeEnum.TWO_SLITS;
      lightSlitWidthControl.enabled = barrierType === BarrierTypeEnum.ONE_SLIT || barrierType === BarrierTypeEnum.TWO_SLITS;
    } );

    // TODO: these controls need to respect the scene--units, ranges, etc.
    var waterSeparationControl = new NumberControl( slitSeparationString, model.waterScene.slitSeparationProperty, new Range( 0, 5 ), _.extend( {
      valuePattern: cmValueString,
      majorTicks: [
        { value: 0, label: createLabel( '0 cm' ) },
        { value: 5, label: createLabel( '5 cm' ) } ]
    }, WaveInterferenceConstants.NUMBER_CONTROL_OPTIONS ) );
    var soundSeparationControl = new NumberControl( slitSeparationString, model.soundScene.slitSeparationProperty, new Range( 0, 50 ), _.extend( {
      valuePattern: cmValueString,
      majorTicks: [
        { value: 0, label: createLabel( '0 cm' ) },
        { value: 50, label: createLabel( '50 cm' ) } ]
    }, WaveInterferenceConstants.NUMBER_CONTROL_OPTIONS ) );
    var lightSeparationControl = new NumberControl( slitSeparationString, model.lightScene.slitSeparationProperty, new Range( 0, 2000 ), _.extend( {
      valuePattern: nmValueString,
      majorTicks: [
        { value: 0, label: createLabel( '0 nm' ) },
        { value: 2000, label: createLabel( '2000 nm' ) } ]
    }, WaveInterferenceConstants.NUMBER_CONTROL_OPTIONS ) );
    var slitSeparationControl = new ToggleNode( [
      { value: model.waterScene, node: waterSeparationControl },
      { value: model.soundScene, node: soundSeparationControl },
      { value: model.lightScene, node: lightSeparationControl }
    ], model.sceneProperty );

    model.barrierTypeProperty.link( function( barrierType ) {
      waterSeparationControl.enabled = barrierType === BarrierTypeEnum.TWO_SLITS;
      soundSeparationControl.enabled = barrierType === BarrierTypeEnum.TWO_SLITS;
      lightSeparationControl.enabled = barrierType === BarrierTypeEnum.TWO_SLITS;
    } );

    // Vertical layout
    slitWidthControl.top = comboBox.bottom + 2;
    slitSeparationControl.top = slitWidthControl.bottom + 2;

    // Horizontal layout
    slitWidthControl.centerX = comboBox.centerX;
    slitSeparationControl.left = slitWidthControl.left;

    var content = alignGroup.createBox( new Node( {
      children: [
        comboBox,
        slitWidthControl,
        slitSeparationControl
      ]
    } ) );

    WaveInterferencePanel.call( this, content, options );
  }

  waveInterference.register( 'SlitsControlPanel', SlitsControlPanel );

  return inherit( WaveInterferencePanel, SlitsControlPanel );
} );