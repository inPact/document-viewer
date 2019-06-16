

import DocumentFactory from '../helpers/documentFactory.service';
import HtmlCreator from '../helpers/htmlCreator.service';

export default class SignatureService {

    constructor() {
        this.$htmlCreator = new HtmlCreator();
    }

    getSignature(element) {

        this._doc = DocumentFactory.get();
        let documentInfo = DocumentFactory.getDocumentInfo();

        if (_.get(documentInfo, 'md.signature') === undefined)
            return;

        let signatureData = documentInfo.md.signature;
        let dimension = _.get(signatureData, 'dimension') || '300 50 150 380';

        let contenier = this.$htmlCreator.create({
            type: 'div',
            id: 'signature-contenier',
            classList: ['signature-container'],
            attributes: [
                { key: "width", value: "100%" },
                { key: "height", value: "30px" },
            ]
        })

        let elementSvg = this.makeSVG('svg', {
            'id': "svg",
            'width': "100%",
            'height': "70",
            'transform': "translate(0,0)",
            'viewBox': dimension,
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