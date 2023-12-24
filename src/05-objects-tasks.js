/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */

/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  this.width = width;
  this.height = height;
  this.getArea = function getArea() {
    return this.width * this.height;
  };
}

/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}

/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  const object = JSON.parse(json);
  Object.setPrototypeOf(object, proto);
  return object;
}

/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */
const throwErrorMoreThanOne = () => {
  throw new Error(
    'Element, id and pseudo-element should not occur more then one time inside the selector',
  );
};

const throwErrorOrder = () => {
  throw new Error(
    'Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element',
  );
};

const cssSelectorOrder = {
  element: 0,
  id: 1,
  classes: 2,
  attrs: 3,
  pseudoClass: 4,
  pseudoElement: 5,
};

class CSSSelectorBuilder {
  constructor(
    order,
    prefix,
    element,
    id,
    classes,
    attrs,
    pseudoClasses,
    psuedoElement,
  ) {
    this.order = order;
    this.prefix = prefix;
    this.elementValue = element;
    this.idValue = id;
    this.classes = classes;
    this.attrs = attrs;
    this.pseudoClasses = pseudoClasses;
    this.psuedoElementValue = psuedoElement;
  }

  stringify() {
    return `${this.prefix}${this.elementValue}${this.idValue ? '#' : ''}${
      this.idValue
    }${this.classes.map((cssClass) => `.${cssClass}`).join('')}${this.attrs.map(
      (attr) => `[${attr}]`,
    )}${this.pseudoClasses.map((pseudoClass) => `:${pseudoClass}`).join('')}${
      this.psuedoElementValue ? '::' : ''
    }${this.psuedoElementValue}`;
  }

  element(value) {
    if (this.elementValue) throwErrorMoreThanOne();
    if (this.order > cssSelectorOrder.element) throwErrorOrder();
    return new CSSSelectorBuilder(
      cssSelectorOrder.element,
      this.prefix,
      value,
      this.idValue,
      this.classes,
      this.attrs,
      this.pseudoClasses,
      this.psuedoElementValue,
    );
  }

  id(value) {
    if (this.idValue) throwErrorMoreThanOne();
    if (this.order > cssSelectorOrder.id) throwErrorOrder();
    return new CSSSelectorBuilder(
      cssSelectorOrder.id,
      this.prefix,
      this.elementValue,
      value,
      this.classes,
      this.attrs,
      this.pseudoClasses,
      this.psuedoElementValue,
    );
  }

  class(value) {
    if (this.order > cssSelectorOrder.classes) throwErrorOrder();
    return new CSSSelectorBuilder(
      cssSelectorOrder.classes,
      this.prefix,
      this.elementValue,
      this.idValue,
      [...this.classes, value],
      this.attrs,
      this.pseudoClasses,
      this.psuedoElementValue,
    );
  }

  attr(value) {
    if (this.order > cssSelectorOrder.attrs) throwErrorOrder();
    return new CSSSelectorBuilder(
      cssSelectorOrder.attrs,
      this.prefix,
      this.elementValue,
      this.idValue,
      this.classes,
      [...this.attrs, value],
      this.pseudoClasses,
      this.psuedoElementValue,
    );
  }

  pseudoClass(value) {
    if (this.order > cssSelectorOrder.pseudoClass) throwErrorOrder();
    return new CSSSelectorBuilder(
      cssSelectorOrder.pseudoClass,
      this.prefix,
      this.elementValue,
      this.idValue,
      this.classes,
      this.attrs,
      [...this.pseudoClasses, value],
      this.psuedoElementValue,
    );
  }

  pseudoElement(value) {
    if (this.psuedoElementValue) throwErrorMoreThanOne();
    return new CSSSelectorBuilder(
      cssSelectorOrder.pseudoElement,
      this.prefix,
      this.elementValue,
      this.idValue,
      this.classes,
      this.attrs,
      this.pseudoClasses,
      value,
    );
  }

  static combine(selector1, combinator, selector2) {
    return new CSSSelectorBuilder(
      1000,
      `${selector1.stringify()} ${combinator} ${selector2.stringify()}`,
      '',
      '',
      [],
      [],
      [],
      '',
    );
  }
}

const cssSelectorBuilder = new CSSSelectorBuilder(
  -1,
  '',
  '',
  '',
  [],
  [],
  [],
  '',
);

cssSelectorBuilder.combine = CSSSelectorBuilder.combine;

module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
