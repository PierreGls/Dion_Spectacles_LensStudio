/* To copy  
    @input('int')
    @widget(
        new ComboBoxWidget([
            new ComboBoxItem('linear', 0), 
            new ComboBoxItem('easeInQuad', 1), 
            new ComboBoxItem('easeOutQuad', 2), 
            new ComboBoxItem('easeInOutQuad', 3), 
            new ComboBoxItem('easeInCubic', 4), 
            new ComboBoxItem('easeOutCubic', 5), 
            new ComboBoxItem('easeInOutCubic', 6)])
    )
    easingName: number = 0;
*/

export class Easing {
  
  static linear(t: number): number {
    return t;
  }

  static easeInQuad(t: number): number {
    return t * t;
  }

  static easeOutQuad(t: number): number {
    return t * (2 - t);
  }

  static easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  static easeInCubic(t: number): number {
    return t * t * t;
  }

  static easeOutCubic(t: number): number {
    return (--t) * t * t + 1;
  }

  static easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  }

  //////////////////////////////////////////
  //				Global Call
  //////////////////////////////////////////

  static easings = [
    this.linear, this.easeInQuad, this.easeOutQuad, this.easeInOutQuad,
    this.easeInCubic, this.easeOutCubic ,this.easeInOutCubic
    ];

  static easingCall = function (id, k)
  {
    return this.easings[id](k);
  }

  static getEasing = function (id)
  {
    return this.easings[id];
  }
}