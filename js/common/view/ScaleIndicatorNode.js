// Copyright 2018, University of Colorado Boulder

/**
 * Appears above the lattice and shows the scale (like 500 nanometers)
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Line = require( 'SCENERY/nodes/Line' );
  var Node = require( 'SCENERY/nodes/Node' );
  var SceneTypeEnum = require( 'WAVE_INTERFERENCE/common/model/SceneTypeEnum' );
  var waveInterference = require( 'WAVE_INTERFERENCE/waveInterference' );
  var WaveInterferenceText = require( 'WAVE_INTERFERENCE/common/view/WaveInterferenceText' );

  /**
   * @param {Property.<SceneTypeEnum>} sceneProperty
   * @param {Object} [options]
   * @constructor
   */
  function ScaleIndicatorNode( sceneProperty, options ) {

    var createNodes = function() {

      var scene = sceneProperty.value;

      // TODO: we need to organize units and unify these values with the frequency values
      // Arrow length
      var arrowLength = scene === SceneTypeEnum.WATER ? 40 :
                        scene === SceneTypeEnum.SOUND ? 75 :
                        scene === SceneTypeEnum.LIGHT ? 50 :
                        -1;

      // Text to display
      // TODO: i18n
      var string = scene === SceneTypeEnum.WATER ? '10 centimeters' :
                   scene === SceneTypeEnum.SOUND ? '1 meter' :
                   scene === SceneTypeEnum.LIGHT ? '500 nanometers' :
                   '???';

      var text = new WaveInterferenceText( string );
      var createLine = function() {
        return new Line( 0, 0, 0, text.height, { stroke: 'black' } );
      };
      var line1 = createLine();
      var line2 = createLine();
      var arrowNode = new ArrowNode( 0, 0, arrowLength, 0, {
        doubleHead: true,
        headHeight: 5,
        headWidth: 5,
        tailWidth: 2
      } );

      // Layout
      arrowNode.leftCenter = line1.rightCenter;
      line2.leftCenter = arrowNode.rightCenter;
      text.leftCenter = line2.rightCenter.plusXY( 5, 1 );
      return [
        line1, arrowNode, line2, text
      ];
    };
    var self = this;

    Node.call( this, _.extend( {
      children: createNodes()
    }, options ) );

    sceneProperty.lazyLink( function() {
      self.children = createNodes();
    } );
  }

  waveInterference.register( 'ScaleIndicatorNode', ScaleIndicatorNode );

  return inherit( Node, ScaleIndicatorNode );
} );