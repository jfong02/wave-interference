// Copyright 2018, University of Colorado Boulder

/**
 * Depicts the draggable chart node with two probes which begins in the toolbox.  TODO: move to common code
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var ChartToolProbeNode = require( 'WAVE_INTERFERENCE/common/view/ChartToolProbeNode' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var Color = require( 'SCENERY/util/Color' );
  var DragListener = require( 'SCENERY/listeners/DragListener' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Line = require( 'SCENERY/nodes/Line' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var ShadedRectangle = require( 'SCENERY_PHET/ShadedRectangle' );
  var Shape = require( 'KITE/Shape' );
  var Util = require( 'DOT/Util' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Vector2 = require( 'DOT/Vector2' );
  var waveInterference = require( 'WAVE_INTERFERENCE/waveInterference' );
  var WaveInterferenceText = require( 'WAVE_INTERFERENCE/common/view/WaveInterferenceText' );
  var WireNode = require( 'WAVE_INTERFERENCE/common/view/WireNode' );

  // constants
  var SECONDS_TO_SHOW = 2;
  var SERIES_1_COLOR = '#5c5d5f'; // same as in Bending Light
  var SERIES_2_COLOR = '#ccced0'; // same as in Bending Light
  var PATH_LINE_WIDTH = 2;
  var GRAPH_WIDTH = 112;
  var GRAPH_HEIGHT = 85;
  var NUMBER_VERTICAL_DASHES = 12;
  var DASH_LENGTH = GRAPH_HEIGHT / NUMBER_VERTICAL_DASHES / 2;
  var DASH_PATTERN = [ DASH_LENGTH + 0.6, DASH_LENGTH - 0.6 ];
  var LINE_WIDTH = 0.8;
  var LINE_OPTIONS = {
    stroke: 'lightGray',
    lineDash: DASH_PATTERN,
    lineWidth: LINE_WIDTH,
    lineDashOffset: DASH_LENGTH / 2
  };

  /**
   * @param {WavesScreenModel|null} model - model for reading values, null for icon
   * @param {WavesScreenView|null} view - for getting coordinates for model
   * @param {Object} [options]
   * @constructor
   */
  function ChartToolNode( model, view, options ) {
    var self = this;

    options = _.extend( { end: function() {} }, options );

    Node.call( this );

    // @private
    this.synchronizeProbeLocations = true;

    // @private
    this.backgroundNode = new ShadedRectangle( new Bounds2( 0, 0, 150, 120 ), {
      cursor: 'pointer'
    } );

    // @private
    this.backgroundDragListener = new DragListener( {
      translateNode: true,
      drag: function() {
        if ( self.synchronizeProbeLocations ) {

          self.alignProbes();

          // When the wave is paused and the user is dragging the entire ChartToolNode with the probes aligned, they
          // need to sample their new locations
          updatePaths();
        }
        self.probe1WireNode.updateWireShape();
        self.probe2WireNode.updateWireShape();
      },
      end: function() {
        options.end();
        self.synchronizeProbeLocations = false;
      }
    } );
    this.backgroundNode.addInputListener( this.backgroundDragListener );
    this.addChild( this.backgroundNode );

    var graphPanel = new Rectangle( 0, 0, GRAPH_WIDTH, GRAPH_HEIGHT, 5, 5, { // TODO: hardcoded layout
      fill: 'white',
      stroke: 'black',
      lineWidth: 1,
      right: this.backgroundNode.right - 10,
      top: this.backgroundNode.top + 10,
      pickable: false
    } );

    // Horizontal Lines
    graphPanel.addChild( new Line( 0, GRAPH_HEIGHT / 4, GRAPH_WIDTH, GRAPH_HEIGHT / 4, LINE_OPTIONS ) );
    graphPanel.addChild( new Line( 0, GRAPH_HEIGHT / 2, GRAPH_WIDTH, GRAPH_HEIGHT / 2, LINE_OPTIONS ) );
    graphPanel.addChild( new Line( 0, GRAPH_HEIGHT * 3 / 4, GRAPH_WIDTH, GRAPH_HEIGHT * 3 / 4, LINE_OPTIONS ) );

    // Vertical lines
    graphPanel.addChild( new Line( GRAPH_WIDTH / 4, 0, GRAPH_WIDTH / 4, GRAPH_HEIGHT, LINE_OPTIONS ) );
    graphPanel.addChild( new Line( GRAPH_WIDTH / 2, 0, GRAPH_WIDTH / 2, GRAPH_HEIGHT, LINE_OPTIONS ) );
    graphPanel.addChild( new Line( GRAPH_WIDTH * 3 / 4, 0, GRAPH_WIDTH * 3 / 4, GRAPH_HEIGHT, LINE_OPTIONS ) );

    this.backgroundNode.addChild( graphPanel );

    var scaleIndicatorNode = new VBox( {
      children: [
        new WaveInterferenceText( '1 s', { fontSize: 8 } ),
        new ArrowNode( 0, 0, GRAPH_WIDTH / 4 - 1, 0, {
          headHeight: 3,
          headWidth: 3.5,
          tailWidth: 0.5,
          doubleHead: true
        } )
      ],
      left: 0,
      bottom: GRAPH_HEIGHT - 4
    } );
    graphPanel.addChild( scaleIndicatorNode );

    // TODO factor out layout constant between horizontal/vertical
    var horizontalAxisTitle = new WaveInterferenceText( 'Time', {
      top: graphPanel.bottom + 3,
      centerX: graphPanel.centerX,
      fill: 'white'
    } );
    this.backgroundNode.addChild( horizontalAxisTitle );

    var verticalAxisTitle = new WaveInterferenceText( 'Water Height (cm)', {
      fontSize: 11,
      right: graphPanel.left - 3,
      rotation: -Math.PI / 2,
      centerY: graphPanel.centerY,
      fill: 'white'
    } );
    this.backgroundNode.addChild( verticalAxisTitle );

    // @private
    this.probe1Node = new ChartToolProbeNode( {
      color: SERIES_1_COLOR,
      drag: function() {
        self.probe1WireNode.updateWireShape();
        updatePaths();
      }
    } );

    // @private
    this.probe2Node = new ChartToolProbeNode( {
      color: SERIES_2_COLOR,
      drag: function() {
        self.probe2WireNode.updateWireShape();
        updatePaths();
      }
    } );

    // @private
    this.probe1WireNode = new WireNode( this.probe1Node, this.backgroundNode, SERIES_1_COLOR, 0.8 );

    // @private
    this.probe2WireNode = new WireNode( this.probe2Node, this.backgroundNode, new Color( SERIES_2_COLOR ).darkerColor( 0.7 ), 0.9 );

    this.addChild( this.probe1WireNode );
    this.addChild( this.probe1Node );

    this.addChild( this.probe2WireNode );
    this.addChild( this.probe2Node );

    this.alignProbes();

    // Create the "pens" which draw the data at the right side of the graph
    var pen1Node = new Circle( 3, { fill: SERIES_1_COLOR, right: graphPanel.width, centerY: GRAPH_HEIGHT / 2 } );
    var probe1Path = new Path( new Shape(), { stroke: SERIES_1_COLOR, lineWidth: PATH_LINE_WIDTH } );
    graphPanel.addChild( probe1Path );
    graphPanel.addChild( pen1Node );

    var pen2Node = new Circle( 3, { fill: SERIES_2_COLOR, right: graphPanel.width, centerY: GRAPH_HEIGHT / 2 } );
    var probe2Path = new Path( new Shape(), { stroke: SERIES_2_COLOR, lineWidth: PATH_LINE_WIDTH } );
    graphPanel.addChild( probe2Path );
    graphPanel.addChild( pen2Node );

    this.mutate( options );

    var probe1Samples = [];
    var probe2Samples = [];

    var updateProbeData = function( probeNode, penNode, probeSamples, probePath ) {

      if ( model.isChartToolNodeInPlayAreaProperty.get() ) {

        // Look up the location of the cell. The probe node has the cross-hairs at 0,0, so we can use the translation
        // itself as the sensor hot spot.  This doesn't include the damping regions
        var latticeCoordinates = view.globalToLatticeCoordinate( probeNode.parentToGlobalPoint( probeNode.getTranslation() ) );

        var value = model.lattice.getCurrentValue( latticeCoordinates.x + model.lattice.dampX, latticeCoordinates.y + model.lattice.dampY );

        // NaN is returned for out of bounds
        if ( !isNaN( value ) ) {

          // strong wavefronts (bright colors) are positive on the chart
          var chartYValue = Util.linear( 0, 1, GRAPH_HEIGHT / 2, 0, value );
          if ( chartYValue > GRAPH_HEIGHT ) {
            chartYValue = GRAPH_HEIGHT;
          }
          if ( chartYValue < 0 ) {
            chartYValue = 0;
          }
          penNode.centerY = chartYValue;
          probeSamples.push( new Vector2( model.time, chartYValue ) );
        }

        while ( probeSamples.length > 0 && probeSamples[ 0 ].x < model.time - SECONDS_TO_SHOW ) {
          probeSamples.shift();
        }

        // TODO: performance caveat
        var pathShape = new Shape();
        for ( var i = 0; i < probeSamples.length; i++ ) {
          var sample = probeSamples[ i ];
          var xAxisValue = Util.linear( model.time, model.time - SECONDS_TO_SHOW, GRAPH_WIDTH, 0, sample.x );
          pathShape.lineTo( xAxisValue, sample.y );
        }
        probePath.shape = pathShape;
      }
    };

    var updatePaths = function() {
      updateProbeData( self.probe1Node, pen1Node, probe1Samples, probe1Path );
      updateProbeData( self.probe2Node, pen2Node, probe2Samples, probe2Path );
    };

    // Update the chart value when the lattice changes
    model && model.lattice.changedEmitter.addListener( updatePaths );
  }

  waveInterference.register( 'ChartToolNode', ChartToolNode );

  return inherit( Node, ChartToolNode, {

    /**
     * Put the probes into their standard position relative to the chart body.
     */
    alignProbes: function() {

      this.probe1Node.mutate( {
        left: this.backgroundNode.right + 5,
        top: this.backgroundNode.top + 10
      } );

      this.probe2Node.mutate( {
        left: this.probe1Node.right - 10,
        top: this.probe1Node.bottom - 10
      } );

      this.probe1WireNode.updateWireShape();
      this.probe2WireNode.updateWireShape();
    },

    getBackgroundNodeGlobalBounds: function() {
      return this.localToGlobalBounds( this.backgroundNode.bounds );
    },

    /**
     * Forward an event from the toolbox to start dragging the node in the play area.
     * @param event
     */
    startDrag: function( event ) {
      this.backgroundDragListener.press( event, this.backgroundNode );
      this.synchronizeProbeLocations = true;
    }
  } );
} );