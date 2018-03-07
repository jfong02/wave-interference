// Copyright 2018, University of Colorado Boulder

/**
 * Shows the toolbox from whence tools (measuring tape, stopwatch, probe) can be dragged.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var DragListener = require( 'SCENERY/listeners/DragListener' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MeasuringTapeNode = require( 'SCENERY_PHET/MeasuringTapeNode' );
  var Property = require( 'AXON/Property' );
  var Vector2 = require( 'DOT/Vector2' );
  var waveInterference = require( 'WAVE_INTERFERENCE/waveInterference' );
  var WaveInterferencePanel = require( 'WAVE_INTERFERENCE/waves/view/WaveInterferencePanel' );
  var WaveInterferenceText = require( 'WAVE_INTERFERENCE/waves/view/WaveInterferenceText' );

  /**
   * @param {MeasuringTapeNode} measuringTapeNode
   * @param {AlignGroup} alignGroup - to align with neighbors
   * @param {WavesScreenModel} model
   * @param {Object} [options]
   * @constructor
   */
  function ToolboxPanel( measuringTapeNode, alignGroup, model, options ) {
    var self = this;
    var measuringTapeIcon = new MeasuringTapeNode( new Property( {
      name: 'cm',
      multiplier: 1000
    } ), new BooleanProperty( true ), {
      tipPositionProperty: new Property( new Vector2( 20, 0 ) ),
      hasValue: false,
      interactive: false
    } );
    model.isMeasuringTapeInPlayAreaProperty.link( function( isMeasuringTapeInPlayArea ) {
      measuringTapeIcon.visible = !isMeasuringTapeInPlayArea;
    } );

    // When clicking on the measuring tape icon, pop it out into the play area
    measuringTapeIcon.addInputListener( DragListener.createForwardingListener( function( event ) {
      var targetPosition = self.globalToParentPoint( event.pointer.point );
      var currentPosition = measuringTapeNode.basePositionProperty.value;
      var delta = targetPosition.minus( currentPosition );
      measuringTapeNode.basePositionProperty.set( measuringTapeNode.basePositionProperty.value.plus( delta ) );
      measuringTapeNode.tipPositionProperty.set( measuringTapeNode.tipPositionProperty.value.plus( delta ) );
      measuringTapeNode.startBaseDrag( event );
      model.isMeasuringTapeInPlayAreaProperty.value = true;
    } ) );

    // Layout for the toolbox
    WaveInterferencePanel.call( this,
      alignGroup.createBox( new HBox( {
        spacing: 10,
        children: [
          measuringTapeIcon,
          new WaveInterferenceText( 'Watch' ),
          new WaveInterferenceText( 'Probe' )
        ]
      } ) ),
      options
    );
  }

  waveInterference.register( 'ToolboxPanel', ToolboxPanel );

  return inherit( WaveInterferencePanel, ToolboxPanel );
} );