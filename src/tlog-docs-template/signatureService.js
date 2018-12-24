


export default class SignatureService {
    constructor() {

    }

    getSignature(docObjChosen, element, doc) {
        this._doc = doc;
        let signatureData = docObjChosen.md.signature;
        let signatureDiv = this._doc.createElement('div');
        signatureDiv.id = 'signatureDiv';
        signatureDiv.classList += " signature-container";

        let elementSVGDiv = this._doc.createElement('div');
        elementSVGDiv.id = 'elementSVGDiv'
        elementSVGDiv.classList += " signature-container";
        let newSVG = this._doc.createElement('div');
        newSVG.id = 'newSVG';

        elementSVGDiv.appendChild(newSVG);
        newSVG.outerHTML += `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id='svg' width='100%' height='auto' transform='translate(0, 0)'  viewBox="0 0 500 150" ></svg>`
        let svgNode = elementSVGDiv.getElementsByTagName('svg')[0];
        svgNode.classList += " signature-container";

        elementSVGDiv.appendChild(svgNode);

        signatureDiv.appendChild(elementSVGDiv)

        let elementSVG = signatureDiv.getElementsByTagName('svg')[0];
        elementSVG.id = 'elementSVG';

        let path = this.makeSVG('path', { d: signatureData, version: "1.1", xmlns: "http://www.w3.org/2000/svg", stroke: "#06067f", 'stroke-width': "2", height: "auto", transform: 'translate(50,-40) scale(0.4,0.4)', 'stroke-linecap': "butt", fill: "none", 'stroke-linejoin': "miter" });
        path.setAttribute("width", "50%");
        path.setAttribute("height", "auto");

        elementSVG.setAttribute("width", "100%");
        elementSVG.setAttribute("height", "auto");

        elementSVG.innerHTML = "";
        elementSVG.appendChild(path);
        elementSVG.setAttribute("width", "100%");
        elementSVG.setAttribute("height", "auto");

        elementSVGDiv.appendChild(elementSVG);
        element.appendChild(signatureDiv)

        return element;
    }

    makeSVG(tag, attrs) {
        var el = this._doc.createElementNS('http://www.w3.org/2000/svg', tag);
        for (var k in attrs)
            el.setAttribute(k, attrs[k]);
        return el;
    }

}