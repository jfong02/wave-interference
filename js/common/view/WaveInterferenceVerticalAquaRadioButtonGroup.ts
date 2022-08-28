// Copyright 2018-2020, University of Colorado Boulder
// @ts-nocheck
/**
 * Factors out commonality between VerticalAquaRadioButtonGroups used in this sim.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import VerticalAquaRadioButtonGroup from '../../../../sun/js/VerticalAquaRadioButtonGroup.js';
import waveInterference from '../../waveInterference.js';

class WaveInterferenceVerticalAquaRadioButtonGroup extends VerticalAquaRadioButtonGroup {

  /**
   * @param property
   * @param items - see VerticalAquaRadioButtonGroup
   * @param [options]
   */
  constructor( property, items, options ) {
    options = merge( { spacing: 8 }, options );
    super( property, items, options );
  }
}

waveInterference.register( 'WaveInterferenceVerticalAquaRadioButtonGroup', WaveInterferenceVerticalAquaRadioButtonGroup );
export default WaveInterferenceVerticalAquaRadioButtonGroup;