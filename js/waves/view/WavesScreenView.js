// Copyright 2018, University of Colorado Boulder

/**
 * View for the "Waves" screen
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var AlignGroup = require( 'SCENERY/nodes/AlignGroup' );
  var ControlPanel = require( 'WAVE_INTERFERENCE/waves/view/ControlPanel' );
  var DottedLineNode = require( 'WAVE_INTERFERENCE/waves/view/DottedLineNode' );
  var IncidentWaveTypeEnum = require( 'WAVE_INTERFERENCE/waves/model/IncidentWaveTypeEnum' );
  var inherit = require( 'PHET_CORE/inherit' );
  var RadioButtonGroup = require( 'SUN/buttons/RadioButtonGroup' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var SceneTypeEnum = require( 'WAVE_INTERFERENCE/waves/model/SceneTypeEnum' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var TimeControlPanel = require( 'WAVE_INTERFERENCE/waves/view/TimeControlPanel' );
  var ToolboxPanel = require( 'WAVE_INTERFERENCE/waves/view/ToolboxPanel' );
  var ViewRadioButtonGroup = require( 'WAVE_INTERFERENCE/waves/view/ViewRadioButtonGroup' );
  var WaveAreaGraphNode = require( 'WAVE_INTERFERENCE/waves/view/WaveAreaGraphNode' );
  var WaveAreaNode = require( 'WAVE_INTERFERENCE/waves/view/WaveAreaNode' );
  var waveInterference = require( 'WAVE_INTERFERENCE/waveInterference' );
  var WaveInterferenceConstants = require( 'WAVE_INTERFERENCE/common/WaveInterferenceConstants' );
  var WaveInterferenceText = require( 'WAVE_INTERFERENCE/waves/view/WaveInterferenceText' );
  var WaveInterferenceVerticalAquaRadioButtonGroup = require( 'WAVE_INTERFERENCE/waves/view/WaveInterferenceVerticalAquaRadioButtonGroup' );

  // constants
  var MARGIN = 10;
  var SPACING = 20;

  /**
   * @param {WavesScreenModel} model
   * @constructor
   */
  function WavesScreenView( model ) {
    ScreenView.call( this );

    var waveAreaNode = new WaveAreaNode( model, {
      top: MARGIN,
      centerX: this.layoutBounds.centerX
    } );
    this.addChild( waveAreaNode );

    var waveAreaGraphNode = new WaveAreaGraphNode( {
      x: waveAreaNode.left,
      centerY: WaveInterferenceConstants.WAVE_AREA_WIDTH * 0.75
    } );
    model.showGraphProperty.linkAttribute( waveAreaGraphNode, 'visible' );
    this.addChild( waveAreaGraphNode );

    var dottedLineNode = new DottedLineNode( {
      x: waveAreaNode.left,
      centerY: waveAreaNode.centerY
    } );
    model.showGraphProperty.linkAttribute( dottedLineNode, 'visible' );
    this.addChild( dottedLineNode );

    var resetAllButton = new ResetAllButton( {
      right: this.layoutBounds.right - MARGIN,
      bottom: this.layoutBounds.bottom - MARGIN
    } );
    this.addChild( resetAllButton );

    var viewRadioButtonGroup = new ViewRadioButtonGroup( model.viewTypeProperty, {
      bottom: waveAreaNode.bottom,
      left: waveAreaNode.right + MARGIN
    } );
    this.addChild( viewRadioButtonGroup );

    var controlPanelAlignGroup = new AlignGroup( {

      // Elements should have the same widths but not constrained to have the same heights
      matchVertical: false
    } );

    var controlPanel = new ControlPanel( model, controlPanelAlignGroup, {
      right: this.layoutBounds.right - MARGIN,
      top: this.layoutBounds.top + MARGIN
    } );
    this.addChild( controlPanel );

    var toolboxPanel = new ToolboxPanel( controlPanelAlignGroup, {
      left: controlPanel.left,
      top: controlPanel.bottom + SPACING
    } );
    this.addChild( toolboxPanel );

    var continuousPulseGroup = new WaveInterferenceVerticalAquaRadioButtonGroup( [ {
      node: new WaveInterferenceText( 'Continuous' ),
      value: IncidentWaveTypeEnum.CONTINUOUS,
      property: model.inputTypeProperty
    }, {
      node: new WaveInterferenceText( 'Pulse' ),
      value: IncidentWaveTypeEnum.PULSE,
      property: model.inputTypeProperty
    } ], {
      top: MARGIN,
      left: MARGIN
    } );
    this.addChild( continuousPulseGroup );

    var timeControlPanel = new TimeControlPanel( model, {
      bottom: this.layoutBounds.bottom - MARGIN,
      right: waveAreaNode.right
    } );
    this.addChild( timeControlPanel );

    var sceneRadioButtons = new RadioButtonGroup( model.sceneProperty, [ {
      value: SceneTypeEnum.WATER,
      node: new WaveInterferenceText( 'water' )
    }, {
      value: SceneTypeEnum.SOUND,
      node: new WaveInterferenceText( 'sound' )
    }, {
      value: SceneTypeEnum.LIGHT,
      node: new WaveInterferenceText( 'light' )
    } ], {
      orientation: 'horizontal',
      bottom: this.layoutBounds.bottom - MARGIN,
      left: waveAreaNode.left
    } );
    this.addChild( sceneRadioButtons );
  }

  waveInterference.register( 'WavesScreenView', WavesScreenView );

  return inherit( ScreenView, WavesScreenView );
} );