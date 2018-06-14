import {Elements} from "./elements";
import _ from "lodash";
import actions from "../actions/index"
import joint from "jointjs"
import EventBus from "../lib/event-bus"

export class Builder {
    constructor(graph, paper) {
        this.graph = graph
        this.paper = paper
        this.collection = []
        this.targetShape = null
        this.sourceShape = null
    }

    /**
     * Create a shape based in type
     * @param type
     * @param options
     */
    createShape(type, options) {
        let element,
            defaultOptions = {
                $type: type,
                id: options.id,
                name: options.bpmnElement && options.bpmnElement.name ? options.bpmnElement.name : options.name ? options.name : "",
                moddleElement: options
            };
        defaultOptions = _.extend(defaultOptions, options);
        // Type Example - bpmn:StartEvent
        if (Elements[options.eClass]) {
            element = new Elements[options.eClass](
                defaultOptions,
                this.graph,
                this.paper
            );
            element.render();
            this.collection.push(element)
            this.paper.on('element:pointerclick', this.onClickShape())
            this.paper.on('blank:pointerclick', this.onClickCanvas())
        }
    }

    /**
     * onClick event for a shape
     * @param element
     * @returns {function(*)}
     */
    onClickShape() {
        let that = this;
        return (elJoint) => {
            let el = that.findElementInCollection(elJoint)
            if (el) {
                debugger
                if (that.sourceShape) {
                    that.connect(this.sourceShape, el)
                } else {
                    that.hideCrown();
                    el.showCrown()
                    that.selection = [];
                    that.selection.push(el);
                }
            }
            return false;
        };
    }

    /**
     * onClick event for canvas
     * @param element
     * @returns {function(*)}
     */
    onClickCanvas() {
        let that = this;
        return (element) => {
            that.hideCrown()
            return false;
        };
    }


    /**
     * Remove selection border of all shapes selected
     */
    removeSelectionBorder() {
        _.forEach(this.selection, (el) => {
            el.removeSelectionBorder();
        });
    }

    /**
     * This method removes the crown in the selected shape
     */
    hideCrown() {
        _.forEach(this.selection, (el) => {
            el.hideCrown();
        });
    }

    /**
     * Remove the shape selected
     * @param element
     * @returns {function(*)}
     */
    removeSelection() {
        _.forEach(this.selection, (el) => {
            el.hideCrown();
            el.remove();
        });
    }

    /**
     * Update the position in Shapes
     * @param element
     */
    updatePosition(element) {
        this.hideCrown()
        let res = _.find(this.collection, (o) => {
            return element.id === o.shape.id
        })
        if (res) {
            res.config(element.get("position"))
        }
    }

    /**
     * Connect shapes
     * @param source
     * @param target
     */
    connect(source, target) {
        let flow = new Elements["Flow"]({
                source,
                target
            },
            this.graph,
            this.paper
        );
        flow.render()
        source.hideCrown()
        target.hideCrown()
        this.sourceShape = null
    }

    findElementInCollection(element) {
        return _.find(this.collection, (o) => {
            return element.model.id === o.shape.id
        })
    }

    setSourceElement() {
        this.sourceShape = this.selection.pop()
    }
}
