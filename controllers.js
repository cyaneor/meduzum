/**
 * @file controllers.js
 * @brief Unified DOM Event Controller Framework
 *
 * @details
 * Comprehensive framework for abstracting and managing DOM event handling through a structured
 * controller pattern. Provides base classes and concrete implementations for mouse, touch,
 * and composite event handling scenarios.
 *
 * @section features Key Features
 * - Hierarchical controller architecture with abstract base implementation
 * - Concrete controllers for mouse and touch input with unified event interfaces
 * - Composite controller for managing multiple input sources as a single unit
 * - Lifecycle management with initialization/disposal patterns
 * - Custom event system with registration/triggering capabilities
 * - Activation state control for all controllers
 *
 * @section architecture Core Architecture
 * 1. AbstractController (Base Class)
 *    - Event handler registry system
 *    - Activation state management
 *    - Element/document binding
 *    - Abstract lifecycle methods
 *
 * 2. Concrete Implementations:
 *    - MouseController: Normalizes mouse events ('start', 'move', 'end', 'enter', 'leave')
 *    - TouchController: Normalizes touch events ('start', 'move', 'end', 'cancel')
 *      with touch capability detection
 *
 * 3. MultiController (Composite):
 *    - Manages collection of child controllers
 *    - Propagates lifecycle methods and events
 *    - Enables batch operations
 *
 * @section usage Basic Usage Examples
 * @subsection single Single Controller
 * @code
 * const mouseCtrl = new MouseController(element);
 * mouseCtrl.registerCallback('move', (e) => console.log(e.clientX, e.clientY));
 * mouseCtrl.initialize();
 * @endcode
 *
 * @subsection composite Composite Controller
 * @code
 * const multiCtrl = new MultiController(element);
 * multiCtrl.createController(MouseController)
 *         .createController(TouchController)
 *         .registerCallback('start', () => console.log('Interaction started'))
 *         .initialize();
 * @endcode
 *
 * @section notes Important Notes
 * - All controllers require explicit initialization
 * - Base classes cannot be instantiated directly
 * - TouchController automatically checks for touch support
 * - Event handlers receive normalized controller events
 *
 * @section compatibility Compatibility
 * - Modern browsers with ES6 support
 * - Touch events require touch-capable devices
 * - Passive event listeners used where appropriate
 *
 * @warning Never instantiate AbstractController directly
 * @note Consider using MultiController for complex interaction scenarios
 *
 * @see AbstractController
 * @see MouseController
 * @see TouchController
 * @see MultiController
 *
 * @author Egor Tsyganchuk
 * @date 2025-02-08
 * @version 1.1.0
 * @license MIT
 */

/**
 * @interface ControllerInterface
 * @brief Abstract base class providing event handling infrastructure
 *
 * The Controller class serves as an abstract base class for concrete controller implementations.
 * It provides basic event handling capabilities and activation state management.
 *
 * @warning This class is interface and cannot be instantiated directly.
 */
class ControllerInterface {
    /**
     * @brief Constructor for the abstract Controller class
     * @throws {Error} If instantiated directly (without inheritance)
     */
    constructor() {
        if (new.target === ControllerInterface) {
            throw new Error("Cannot instantiate interface class 'ControllerInterface' directly");
        }
    }

    /**
     * @brief Gets the controlled DOM element
     * @return {HTMLElement} The controlled element
     */
    getElement() {
    }

    /**
     * @brief Gets the document instance used for global events
     * @return {Document} The document instance
     */
    getDocument() {
    }

    /**
     * @brief Gets the current enabled state of the controller
     * @return {boolean} True if active, false if inactive
     */
    getEnabled() {
    }

    /**
     * @brief Sets the enabled state of the controller
     * @param {boolean} enabled - Whether to enable or disable
     * @return void
     */
    setEnabled(enabled) {
    }

    /**
     * @brief Registers a callback for a specific event
     * @param {string} event - Event name to register handler for
     * @param {function} callback - Callback function to register
     * @return {ControllerInterface} Returns this for chaining
     */
    registerCallback(event, callback) {
    }

    /**
     * @brief Unregisters a callback for a specific event
     * @param {string} event - Event name to unregister from
     * @param {function} callback - Callback function to remove
     * @return {ControllerInterface} Returns this for chaining
     */
    unregisterCallback(event, callback) {
    }

    /**
     * @brief Triggers registered handlers for a specific event
     * @param {string} event - Event name to trigger
     * @param {...*} args - Arguments to pass to handlers
     * @return {ControllerInterface} Returns this for chaining
     */
    trigger(event, ...args) {
    }

    /**
     * @brief Abstract method to initialize the controller
     */
    initialize() {
    }

    /**
     * @brief Abstract method to clean up controller resources
     */
    dispose() {
    }
}

/**
 * @abstract AbstractController
 * @brief Abstract base class providing event handling infrastructure
 *
 * The Controller class serves as an abstract base class for concrete controller implementations.
 * It provides basic event handling capabilities and activation state management.
 *
 * @warning This class is abstract and cannot be instantiated directly.
 */
class AbstractController extends ControllerInterface {
    /**
     * @brief Constructor for the abstract Controller class
     * @param {HTMLElement} element - DOM element to monitor for events
     * @param {Document} [doc=document] - Document instance to register global events
     * @throws {Error} If instantiated directly (without inheritance)
     */
    constructor(element, doc = document) {
        super();
        if (new.target === AbstractController) {
            throw new Error("Cannot instantiate abstract class 'AbstractController' directly");
        }

        /**
         * @property {boolean} __enabled - Activation state of the controller
         * @private
         */
        this.__enabled = false;

        /**
         * @property {Object.<string, function[]>} __handlers - Event callback registry
         * @private
         */
        this.__handlers = [];

        /**
         * @property {HTMLElement} __element - The controlled DOM element
         * @private
         */
        this.__element = element;

        /**
         * @property {Document} __document - The document instance for global event listeners
         * @private
         */
        this.__document = doc;
    }

    /**
     * @brief Gets the controlled DOM element
     * @return {HTMLElement} The controlled element
     */
    getElement() {
        return this.__element;
    }

    /**
     * @brief Gets the document instance used for global events
     * @return {Document} The document instance
     */
    getDocument() {
        return this.__document;
    }

    /**
     * @brief Gets the current enabled state of the controller
     * @return {boolean} True if enabled, false if disabled
     */
    getEnabled() {
        return this.__enabled;
    }

    /**
     * @brief Sets the enabled state of the controller
     * @param {boolean} enabled - Whether to enable or disable
     * @return void
     */
    setEnabled(enabled) {
        this.__enabled = enabled;
    }

    /**
     * @brief Registers a callback for a specific event
     * @param {string} event - Event name to register handler for
     * @param {function} callback - Callback function to register
     * @return {AbstractController} Returns this for chaining
     */
    registerCallback(event, callback) {
        if (!this.__handlers[event]) {
            this.__handlers[event] = [];
        }
        this.__handlers[event].push(callback);
        return this;
    }

    /**
     * @brief Unregisters a callback for a specific event
     * @param {string} event - Event name to unregister from
     * @param {function} callback - Callback function to remove
     * @return {AbstractController} Returns this for chaining
     */
    unregisterCallback(event, callback) {
        if (this.__handlers[event]) {
            this.__handlers[event] = this.__handlers[event].filter(handler => handler !== callback);
        }
        return this;
    }

    /**
     * @brief Triggers registered handlers for a specific event
     * @param {string} event - Event name to trigger
     * @param {...*} args - Arguments to pass to handlers
     * @return {AbstractController} Returns this for chaining
     */
    trigger(event, ...args) {
        if (this.getEnabled() && this.__handlers[event]) {
            this.__handlers[event].forEach(handler => handler(...args));
        }
        return this;
    }
}

/**
 * @class MouseController
 * @brief Concrete controller implementation for mouse event handling
 * @extends AbstractController
 *
 * The MouseController class provides mouse event handling capabilities
 * for a specific DOM element. It translates native mouse events into
 * controller events ('start', 'move', 'end', 'enter', 'leave') with proper activation state management.
 */
class MouseController extends AbstractController {
    /**
     * @brief Handles mouse down events
     * @param {MouseEvent} e - The mouse event object
     * @private
     */
    handleMouseDown(e) {
        this.trigger('start', e);
    }

    /**
     * @brief Handles mouse move events
     * @param {MouseEvent} e - The mouse event object
     * @private
     */
    handleMouseMove(e) {
        this.trigger('move', e);
    }

    /**
     * @brief Handles mouse up events
     * @param {MouseEvent} e - The mouse event object
     * @private
     */
    handleMouseUp(e) {
        this.trigger('end', e);
    }

    /**
     * @brief Handles mouse enter events
     * @param {MouseEvent} e - The mouse event object
     * @private
     */
    handleMouseEnter(e) {
        this.trigger('enter', e);
    }

    /**
     * @brief Handles mouse leave events
     * @param {MouseEvent} e - The mouse event object
     * @private
     */
    handleMouseLeave(e) {
        this.trigger('leave', e);
    }

    /**
     * @brief Constructor for MouseController
     * @param {HTMLElement} element - DOM element to monitor for mouse events
     * @param {Document} [doc=document] - Document instance to register global mouse events
     *
     * Initializes the mouse controller for a specific element and binds
     * event handlers. Note the controller must be initialized to begin
     * listening to events.
     */
    constructor(element, doc = document) {
        super(element, doc);

        /**
         * @property {function} mouseDownHandler - Bound mouse down handler
         * @private
         */
        this.mouseDownHandler = this.handleMouseDown.bind(this);

        /**
         * @property {function} mouseMoveHandler - Bound mouse move handler
         * @private
         */
        this.mouseMoveHandler = this.handleMouseMove.bind(this);

        /**
         * @property {function} mouseUpHandler - Bound mouse up handler
         * @private
         */
        this.mouseUpHandler = this.handleMouseUp.bind(this);

        /**
         * @property {function} mouseEnterHandler - Bound mouse enter handler
         * @private
         */
        this.mouseEnterHandler = this.handleMouseEnter.bind(this);

        /**
         * @property {function} mouseLeaveHandler - Bound mouse leave handler
         * @private
         */
        this.mouseLeaveHandler = this.handleMouseLeave.bind(this);
    }

    /**
     * @brief Initializes the mouse controller
     *
     * Sets up event listeners on both the element (for mousedown, mouseenter, mouseleave)
     * and document (for mousemove/mouseup) and activates the controller.
     */
    initialize() {
        this.getElement().addEventListener('mousedown', this.mouseDownHandler);
        this.getDocument().addEventListener('mousemove', this.mouseMoveHandler);
        this.getDocument().addEventListener('mouseup', this.mouseUpHandler);
        this.getElement().addEventListener('mouseenter', this.mouseEnterHandler);
        this.getElement().addEventListener('mouseleave', this.mouseLeaveHandler);
        this.setEnabled(true);
    }

    /**
     * @brief Cleans up the mouse controller
     *
     * Removes all event listeners and deactivates the controller.
     * Should be called when the controller is no longer needed.
     */
    dispose() {
        this.getElement().removeEventListener('mousedown', this.mouseDownHandler);
        this.getDocument().removeEventListener('mousemove', this.mouseMoveHandler);
        this.getDocument().removeEventListener('mouseup', this.mouseUpHandler);
        this.getElement().removeEventListener('mouseenter', this.mouseEnterHandler);
        this.getElement().removeEventListener('mouseleave', this.mouseLeaveHandler);
        this.setEnabled(false);
    }
}

/**
 * @class TouchController
 * @brief Concrete controller implementation for touch event handling
 * @extends AbstractController
 *
 * The TouchController class provides touch event handling capabilities
 * for a specific DOM element. It translates native touch events into
 * controller events ('start', 'move', 'end', 'cancel') with proper activation state management.
 */
class TouchController extends AbstractController {
    /**
     * @brief Gets the maximum number of simultaneous touch points supported by the device
     * @return {number} Maximum number of touch points or 0 if not supported
     * @static
     */
    static getMaxTouchPoints() {
        return ('maxTouchPoints' in navigator)
            ? navigator.maxTouchPoints : 0;
    }

    /**
     * @brief Checks if touch input is supported by the device
     * @return {boolean} True if touch is supported, false otherwise
     * @static
     */
    static isTouchSupported() {
        return TouchController.getMaxTouchPoints() > 0;
    }

    /**
     * @brief Checks if multitouch input is supported by the device
     * @return {boolean} True if multitouch is supported (2+ touch points), false otherwise
     * @static
     */
    static isMultiTouchSupported() {
        return TouchController.getMaxTouchPoints() >= 2;
    }

    /**
     * @brief Handles touch start events
     * @param {TouchEvent} e - The touch event object
     * @private
     */
    handleTouchStart(e) {
        this.trigger('start', e);
    }

    /**
     * @brief Handles touch move events
     * @param {TouchEvent} e - The touch event object
     * @private
     */
    handleTouchMove(e) {
        this.trigger('move', e);
    }

    /**
     * @brief Handles touch end events
     * @param {TouchEvent} e - The touch event object
     * @private
     */
    handleTouchEnd(e) {
        this.trigger('end', e);
    }

    /**
     * @brief Handles touch cancel events
     * @param {TouchEvent} e - The touch event object
     * @private
     */
    handleTouchCancel(e) {
        this.trigger('cancel', e);
    }

    /**
     * @brief Constructor for TouchController
     * @param {HTMLElement} element - DOM element to monitor for touch events
     * @param {Document} [doc=document] - Document instance to register global touch events
     *
     * Initializes the touch controller for a specific element and binds
     * event handlers. Note the controller must be initialized to begin
     * listening to events.
     */
    constructor(element, doc = document) {
        super(element, doc);

        // Checking for touch support before creating a controller
        if (!TouchController.isTouchSupported()) {
            throw new Error('Touch is not supported on this device');
        }

        /**
         * @property {function} touchStartHandler - Bound touch start handler
         * @private
         */
        this.touchStartHandler = this.handleTouchStart.bind(this);

        /**
         * @property {function} touchMoveHandler - Bound touch move handler
         * @private
         */
        this.touchMoveHandler = this.handleTouchMove.bind(this);

        /**
         * @property {function} touchEndHandler - Bound touch end handler
         * @private
         */
        this.touchEndHandler = this.handleTouchEnd.bind(this);

        /**
         * @property {function} touchCancelHandler - Bound touch cancel handler
         * @private
         */
        this.touchCancelHandler = this.handleTouchCancel.bind(this);
    }

    /**
     * @brief Initializes the touch controller
     * @override
     *
     * Sets up event listeners on the element for touch events
     * and activates the controller.
     */
    initialize() {
        this.getElement().addEventListener('touchstart', this.touchStartHandler, {passive: false});
        this.getElement().addEventListener('touchmove', this.touchMoveHandler, {passive: false});
        this.getElement().addEventListener('touchend', this.touchEndHandler);
        this.getElement().addEventListener('touchcancel', this.touchCancelHandler);
        this.setEnabled(true);
    }

    /**
     * @brief Cleans up the touch controller
     * @override
     *
     * Removes all event listeners and deactivates the controller.
     * Should be called when the controller is no longer needed.
     */
    dispose() {
        this.getElement().removeEventListener('touchstart', this.touchStartHandler);
        this.getElement().removeEventListener('touchmove', this.touchMoveHandler);
        this.getElement().removeEventListener('touchend', this.touchEndHandler);
        this.getElement().removeEventListener('touchcancel', this.touchCancelHandler);
        this.setEnabled(false);
    }
}

/**
 * @class MultiController
 * @brief Composite controller that manages multiple sub-controllers
 * @extends AbstractController
 *
 * The MultiController class provides functionality
 * to manage multiple Controller instances as a single unit.
 *
 * It propagates lifecycle methods (enable/disable/initialize/dispose)
 * and events to all registered sub-controllers.
 */
class MultiController extends ControllerInterface {
    /**
     * @brief Constructor for MultiController
     * @param {HTMLElement} element - DOM element associated with this controller
     * @param {Document} [doc=document] - Document instance for event registration
     *
     * Initializes the multi-controller
     * with an empty list of sub-controllers.
     */
    constructor(element, doc = document) {
        super(element, doc);

        /**
         * @property {boolean} __enabled - Activation state of the controller
         * @private
         */
        this.__enabled = false;

        /**
         * @property {Array<ControllerInterface>} __controllers - Registered sub-controllers
         * @private
         */
        this.__controllers = [];
    }

    /**
     * @brief Adds a controller to the managed collection
     * @param {ControllerInterface} controller - Controller instance to add
     * @return {MultiController} Returns this instance for method chaining
     * @throws {Error} Throws an error if parameter is not a Controller instance
     *
     * Adds the specified controller to the collection
     * and initializes it if this multi-controller is currently enabled.
     */
    addController(controller) {
        if (controller instanceof ControllerInterface) {
            this.__controllers.push(controller);
            if (this.getEnabled()) {
                controller.initialize();
            }
            return this;
        }
        throw new Error("Parameter must be an instance of ControllerInterface");
    }

    /**
     * @brief Creates and adds a new controller of specified type
     * @param {function} controllerClass - Controller class constructor
     * @param {...*} args - Additional arguments to pass to the controller constructor
     * @return {MultiController} Returns this instance for method chaining
     *
     * Instantiates a new controller of the specified class
     * and automatically adds it to the managed collection.
     *
     * The controller is initialized with the same element
     * and document as this multi-controller.
     */
    createController(controllerClass, ...args) {
        return this.addController(new controllerClass(this.getElement(), this.getDocument(), ...args));
    }

    /**
     * @brief Removes a controller from the managed collection
     * @param {ControllerInterface} controller - Controller instance to remove
     * @return {MultiController} Returns this instance for method chaining
     *
     * Removes the specified controller from the collection
     * and disposes it if the controller is currently enabled.
     */
    removeController(controller) {
        const index = this.__controllers.indexOf(controller);
        if (index !== -1) {
            if (controller.getEnabled()) {
                controller.dispose();
            }
            this.__controllers.splice(index, 1);
        }
        return this;
    }

    /**
     * @brief Gets the current enabled state of the controller
     * @return {boolean} True if active, false if inactive
     */
    getEnabled() {
        return this.__enabled;
    }

    /**
     * @override
     * @brief Sets the enabled state of all managed controllers
     * @param {boolean} enabled - Whether to enable or disable the controllers
     *
     * Sets the enabled state of this controller and propagates
     * it to all registered sub-controllers.
     */
    setEnabled(enabled) {
        this.__enabled = enabled;
        this.__controllers.forEach(controller => {
            controller.setEnabled(enabled);
        });
    }

    /**
     * @brief Initializes all managed controllers
     *
     * Initializes this controller and propagates
     * the initialize call to all registered sub-controllers.
     */
    initialize() {
        this.setEnabled(true);
        this.__controllers.forEach(controller => {
            controller.initialize();
        });
    }

    /**
     * @brief Disposes all managed controllers
     *
     * Disposes this controller and propagates
     * the dispose call to all registered sub-controllers.
     */
    dispose() {
        this.setEnabled(false);
        this.__controllers.forEach(controller => {
            controller.dispose();
        });
    }

    /**
     * @brief Clears all managed controllers and resets the collection
     *
     * Disposes all controllers and clears the internal collection,
     * effectively resetting the multi-controller to its initial state.
     */
    clear() {
        this.dispose();
        this.__controllers = [];
    }

    /**
     * @brief Triggers an event on all managed controllers
     *
     * @param {string} event - Event name to trigger
     * @param {...*} args - Arguments to pass to event handlers
     * @return {MultiController} Returns the multi-controller instance for chaining
     *
     * Triggers the specified event on this controller
     * and propagates it to all registered sub-controllers.
     */
    trigger(event, ...args) {
        if (this.getEnabled()) {
            this.__controllers.forEach(controller => {
                controller.trigger(event, ...args);
            });
        }
        return this;
    }
}

export {AbstractController, MouseController, TouchController, MultiController};