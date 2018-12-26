


export default class SignatureService {
    constructor() {

    }

    getSignature(docObjChosen, element, doc) {

        this._doc = doc;

        let signatureData = docObjChosen.md.signature;

        let contenier = this._doc.createElement('div');
        contenier.id = 'signatureDiv';
        contenier.classList += " signature-container";
        contenier.setAttribute("width", "100%");
        contenier.setAttribute("height", "30px");

        let elementSvg = this.makeSVG('svg', {
            'id': "svg",
            'width': "100%",
            'height': "70",
            'transform': "translate(0,0)",
            'viewBox': "300 50 150 380",
            'style': "width: 100%;"
        });

        let path = this.makeSVG('path', {
            d: signatureData.data,
            'stroke': "#06067f",
            'stroke-width': "2",
            'stroke-linecap': "butt",
            'fill': "none",
            'stroke-linejoin': "miter"
        });

        elementSvg.appendChild(path);

        contenier.appendChild(elementSvg);

        element.appendChild(contenier);

        return element;
    }

    makeSVG(tag, attrs) {
        var el = this._doc.createElementNS('http://www.w3.org/2000/svg', tag);
        for (var k in attrs)
            el.setAttributeNS(null, k, attrs[k]);
        return el;
    }

}