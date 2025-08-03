/**
 * @file controllers.js
 * @brief Event controller framework for DOM interaction handling
 *
 * @details
 * This module provides an abstract base class (Controller) and concrete implementations
 * (MouseController, TouchController) for handling DOM events in a structured way.
 * It also includes a composite MultiController for managing multiple controllers as a single unit.
 *
 * The framework features:
 * - Abstract base class with common event handling infrastructure
 * - Concrete implementations for mouse and touch input
 * - Composite controller pattern for grouped management
 * - Lifecycle management (initialize/dispose)
 * - Activation state control (enable/disable)
 * - Custom event triggering system
 *
 * @section architecture Architecture Overview
 * The Controller class serves as an abstract base providing:
 * - Event handler registration/unregistration
 * - Event triggering mechanism
 * - Activation state management
 *
 * Concrete implementations translate native DOM events into controller events:
 * - MouseController: 'start', 'move', 'end', 'enter', 'leave'
 * - TouchController: 'start', 'move', 'end', 'cancel'
 *
 * MultiController provides composite functionality:
 * - Manages collection of child controllers
 * - Propagates lifecycle methods and events
 * - Enables batch operations
 *
 * @section usage Basic Usage Example
 * @code
 * // Create mouse controller for element
 * const mouseCtrl = new MouseController(element);
 * mouseCtrl.registerCallback('move', (e) => console.log('Mouse moved', e));
 * mouseCtrl.initialize();
 *
 * // Create composite controller
 * const multiCtrl = new MultiController(element);
 * multiCtrl.createController(MouseController)
 *         .createController(TouchController);
 * multiCtrl.initialize();
 * @endcode
 *
 * @warning The base Controller class cannot be instantiated directly
 * @note All controllers require explicit initialization before use
 *
 * @see Controller
 * @see MouseController
 * @see TouchController
 * @see MultiController
 *
 * @author Egor Tsyganchuk
 * @date 2025-02-08
 * @version 1.0.0
 * @license MIT
 */

/**
 * @class Controller
 * @brief Abstract base class providing event handling infrastructure
 *
 * The Controller class serves as an abstract base class for concrete controller implementations.
 * It provides basic event handling capabilities and activation state management.
 *
 * @warning This class is abstract and cannot be instantiated directly.
 */
class Controller {
    /**
     * @brief Constructor for the abstract Controller class
     * @param {HTMLElement} element - DOM element to monitor for events
     * @param {Document} [doc=document] - Document instance to register global events
     * @throws {Error} If instantiated directly (without inheritance)
     *
     * Initializes the controller with default inactive state and empty event handlers.
     * The constructor enforces abstract class pattern by checking new.target.
     */
    constructor(element, doc = document) {
        if (new.target === Controller) {
            throw new Error("Cannot instantiate abstract class 'Controller' directly");
        }

        /**
         * @property {boolean} __isActivated - Activation state of the controller
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
     * @brief Checks if the controller is currently enabled
     * @return {boolean} True if the controller is enabled, false otherwise
     *
     * Indicates whether the controller is currently active and processing events.
     */
    isEnabled() {
        return this.__enabled;
    }

    /**
     * @brief Enables the controller
     * @return void
     *
     * Activates the controller, allowing it to process events and trigger callbacks.
     * After calling this method, isEnabled() will return true.
     */
    enable() {
        this.__enabled = true;
    }

    /**
     * @brief Disables the controller
     * @return void
     *
     * Deactivates the controller, preventing it from processing events or triggering callbacks.
     * After calling this method, isEnabled() will return false.
     */
    disable() {
        this.__enabled = false;
    }

    /**
     * @brief Registers a callback for a specific event
     * @param {string} event - Event name to register handler for
     * @param {function} callback - Callback function to register
     * @return {Controller} Returns the controller instance for chaining
     *
     * Adds the provided callback to the specified event's handler list.
     * Creates the event handler array if it doesn't exist.
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
     * @param {string} event Event name to unregister handler from
     * @param {function} callback Callback function to unregister
     * @return {Controller} Returns the controller instance for chaining
     *
     * Removes the provided callback from the specified event's handler list.
     * Does nothing if the callback wasn't registered.
     */
    unregisterCallback(event, callback) {
        if (this.__handlers[event]) {
            this.__handlers[event] = this.__handlers[event].filter(handler => handler !== callback);
        }
        return this;
    }

    /**
     * @brief Triggers registered handlers for a specific event
     * @param {string} event - Event name to trigger (must match a handlers property)
     * @param {...*} args - Arguments to pass to the event handlers
     * @return {Controller} Returns the controller instance for chaining
     *
     * Executes all registered handlers
     * for the specified event if the controller is active.
     *
     * Only triggers handlers if:
     * - The controller is active (isActivate === true)
     * - The event exists in the handlers object
     * - There are handlers registered for the event
     */
    trigger(event, ...args) {
        if (this.isEnabled() && this.__handlers[event]) {
            this.__handlers[event].forEach(handler => handler(...args));
        }
        return this;
    }

    /**
     * @brief Abstract method to initialize the controller
     * @abstract
     *
     * @throws {Error} If not implemented in derived class
     */
    initialize() {
        throw new Error("Method 'initialize()' must be implemented");
    }

    /**
     * @brief Abstract method to clean up controller resources
     * @abstract
     *
     * @throws {Error} If not implemented in derived class
     */
    dispose() {
        throw new Error("Method 'dispose()' must be implemented");
    }
}

/**
 * @class MouseController
 * @brief Concrete controller implementation for mouse event handling
 * @extends Controller
 *
 * The MouseController class provides mouse event handling capabilities
 * for a specific DOM element. It translates native mouse events into
 * controller events ('start', 'move', 'end', 'enter', 'leave') with proper activation state management.
 */
class MouseController extends Controller {
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
     * @override
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
        this.enable();
    }

    /**
     * @brief Cleans up the mouse controller
     * @override
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
        this.disable();
    }
}

/**
 * @class TouchController
 * @brief Concrete controller implementation for touch event handling
 * @extends Controller
 *
 * The TouchController class provides touch event handling capabilities
 * for a specific DOM element. It translates native touch events into
 * controller events ('start', 'move', 'end', 'cancel') with proper activation state management.
 */
class TouchController extends Controller {
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
        this.enable();
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
        this.disable();
    }
}

/**
 * @class MultiController
 * @brief Composite controller that manages multiple sub-controllers
 * @extends Controller
 *
 * The MultiController class provides functionality
 * to manage multiple Controller instances as a single unit.
 *
 * It propagates lifecycle methods (enable/disable/initialize/dispose)
 * and events to all registered sub-controllers.
 */
class MultiController extends Controller {
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
         * @property {Array<Controller>} __controllers - Registered sub-controllers
         * @private
         */
        this.__controllers = [];
    }

    /**
     * @brief Gets all registered sub-controllers
     * @return {Array<Controller>} Array of registered controllers
     */
    getControllers() {
        return this.__controllers;
    }

    /**
     * @brief Adds a controller to the managed collection
     * @param {Controller} controller - Controller instance to add
     * @return {MultiController} Returns this instance for method chaining
     * @throws {Error} Throws an error if parameter is not a Controller instance
     *
     * Adds the specified controller to the collection
     * and initializes it if this multi-controller is currently enabled.
     */
    addController(controller) {
        if (controller instanceof Controller) {
            this.__controllers.push(controller);
            if (this.isEnabled()) {
                controller.initialize();
            }
            return this;
        }
        throw new Error("");
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
     * @param {Controller} controller - Controller instance to remove
     * @return {MultiController} Returns this instance for method chaining
     *
     * Removes the specified controller from the collection
     * and disposes it if the controller is currently enabled.
     */
    removeController(controller) {
        const index = this.__controllers.indexOf(controller);
        if (index !== -1) {
            if (controller.isEnabled()) {
                controller.dispose();
            }
            this.__controllers.splice(index, 1);
        }
        return this;
    }

    /**
     * @brief Enables all managed controllers
     * @override
     *
     * Enables this controller and propagates
     * the enable call to all registered sub-controllers.
     */
    enable() {
        super.enable();
        this.getControllers().forEach(controller => {
            controller.enable();
        });
    }

    /**
     * @brief Disables all managed controllers
     * @override
     *
     * Disables this controller and propagates
     * the disable call to all registered sub-controllers.
     */
    disable() {
        super.disable();
        this.getControllers().forEach(controller => {
            controller.disable();
        });
    }

    /**
     * @brief Initializes all managed controllers
     * @override
     *
     * Initializes this controller and propagates
     * the initialize call to all registered sub-controllers.
     */
    initialize() {
        super.initialize();
        this.getControllers().forEach(controller => {
            controller.initialize();
        });
    }

    /**
     * @brief Disposes all managed controllers
     * @override
     *
     * Disposes this controller and propagates
     * the dispose call to all registered sub-controllers,
     * cleaning up all resources.
     */
    dispose() {
        super.dispose();
        this.getControllers().forEach(controller => {
            controller.dispose();
        });
    }

    /**
     * @brief Triggers an event on all managed controllers
     * @override
     *
     * @param {string} event - Event name to trigger
     * @param {...*} args - Arguments to pass to event handlers
     * @return {MultiController} Returns the multi-controller instance for chaining
     *
     * Triggers the specified event on this controller
     * and propagates it to all registered sub-controllers.
     */
    trigger(event, ...args) {
        super.trigger(event, ...args);
        this.getControllers().forEach(controller => {
            controller.trigger(event, ...args);
        });
        return this;
    }
}

export {Controller, MouseController, TouchController, MultiController};