import { SpreadsheetHelper } from "../util/spreadsheethelper.spec";
import { defaultData } from '../util/datasource.spec';
import { CellModel, DialogBeforeOpenEventArgs, Spreadsheet, dialog, getCell, SheetModel, ValidationModel } from "../../../src/index";
import { Dialog } from "../../../src/spreadsheet/services/index";
import { getComponent, L10n } from '@syncfusion/ej2-base';
import { DropDownList } from "@syncfusion/ej2-dropdowns";


describe('Data validation ->', () => {
    let helper: SpreadsheetHelper = new SpreadsheetHelper('spreadsheet');

    describe('Public Method ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    ranges: [{
                        dataSource: defaultData
                    }],
                }]
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('', (done: Function) => {
            helper.invoke('addDataValidation', [{ type: 'TextLength', operator: 'LessThanOrEqualTo', value1: '12' }, 'A2:A7']);
            const cell: CellModel = helper.getInstance().sheets[0].rows[1].cells[0];
            expect(JSON.stringify(cell.validation)).toBe('{"type":"TextLength","operator":"LessThanOrEqualTo","value1":"12"}');
            helper.invoke('addInvalidHighlight', ['A2:A7']);
            let td: HTMLElement = helper.invoke('getCell', [1, 0]);
            expect(td.style.backgroundColor).toBe('rgb(255, 255, 255)');
            expect(td.style.color).toBe('rgb(0, 0, 0)');
            td = helper.invoke('getCell', [4, 0]);
            expect(td.style.backgroundColor).toBe('rgb(255, 255, 0)');
            expect(td.style.color).toBe('rgb(255, 0, 0)');
            helper.invoke('removeInvalidHighlight', ['A2:A7']);
            expect(td.style.backgroundColor).toBe('rgb(255, 255, 255)');
            expect(td.style.color).toBe('rgb(0, 0, 0)');
            helper.invoke('removeDataValidation', ['A2:A7']);
            expect(helper.getInstance().sheets[0].rows[1].cells[0].validation).toBeUndefined();
            done();
        });

        it('Add list validation', (done: Function) => {
            helper.invoke('addDataValidation', [{ type: 'List', value1: '12,13,14' }, 'D2']);
            const cell: CellModel = helper.getInstance().sheets[0].rows[1].cells[3];
            expect(JSON.stringify(cell.validation)).toBe('{"type":"List","value1":"12,13,14"}');
            helper.invoke('selectRange', ['D2']);
            const td: HTMLElement = helper.invoke('getCell', [1, 3]).children[0];
            expect(td.classList).toContain('e-validation-list');
            const coords: ClientRect = td.getBoundingClientRect();
            helper.triggerMouseAction('mousedown', { x: coords.left, y: coords.top }, document, td);
            helper.triggerMouseAction('mousedup', { x: coords.left, y: coords.top }, document, td);
            (td.querySelector('.e-dropdownlist') as any).ej2_instances[0].dropDownClick({ preventDefault: function () { }, target: td.children[0] });
            setTimeout(() => {
                helper.click('.e-ddl.e-popup li:nth-child(2)');
                expect(helper.getInstance().sheets[0].rows[1].cells[3].value).toBe(13);
                expect(helper.invoke('getCell', [1, 3]).innerText).toBe('13');
                helper.editInUI('15');
                setTimeout(() => {
                    expect(helper.getElements('.e-validationerror-dlg.e-dialog').length).toBe(1);
                    helper.setAnimationToNone('.e-validationerror-dlg.e-dialog');
                    helper.click('.e-validationerror-dlg .e-footer-content button:nth-child(2)');
                    done();
                });
            });
        });
    });

    describe('UI Interaction ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    ranges: [{
                        dataSource: defaultData
                    }],
                }]
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Add Data validation', (done: Function) => {
            helper.invoke('selectRange', ['E3:E2']);
            helper.switchRibbonTab(4);
            helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
            setTimeout(() => {
                helper.click('.e-datavalidation-ddb li:nth-child(1)');
                helper.getElements('.e-datavalidation-dlg #minvalue')[0].value = '12';
                helper.getElements('.e-datavalidation-dlg #maxvalue')[0].value = '25';
                helper.setAnimationToNone('.e-datavalidation-dlg.e-dialog');
                helper.getElements('.e-datavalidation-dlg .e-footer-content')[0].children[1].click();
                expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[4].validation)).toBe('{"type":"WholeNumber","operator":"Between","value1":"12","value2":"25","ignoreBlank":true,"inCellDropDown":null}');
                helper.editInUI('26');
                setTimeout(() => {
                    expect(helper.getElements('.e-validationerror-dlg.e-dialog').length).toBe(1);
                    helper.setAnimationToNone('.e-validationerror-dlg.e-dialog');
                    helper.click('.e-validationerror-dlg .e-footer-content button:nth-child(2)');
                    expect(helper.invoke('getCell', [1, 4]).textContent).toBe('20');
                    done();
                });
            });
        });

        it('Highlight invalid data', (done: Function) => {
            helper.invoke('updateCell', [{ value: 26 }, 'E2']);
            helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
            setTimeout(() => {
                helper.click('.e-datavalidation-ddb li:nth-child(2)');
                expect(helper.invoke('getCell', [1, 4]).style.backgroundColor).toBe('rgb(255, 255, 0)');
                expect(helper.invoke('getCell', [1, 4]).style.color).toBe('rgb(255, 0, 0)');
                done();
            });
        });

        it('Remove highlight', (done: Function) => {
            helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
            setTimeout(() => {
                helper.click('.e-datavalidation-ddb li:nth-child(3)');
                expect(helper.invoke('getCell', [1, 4]).style.backgroundColor).toBe('rgb(255, 255, 255)');
                expect(helper.invoke('getCell', [1, 4]).style.color).toBe('rgb(0, 0, 0)');
                done();
            });
        });

        it('Remove data validation', (done: Function) => {
            helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
            setTimeout(() => {
                helper.click('.e-datavalidation-ddb li:nth-child(4)');
                expect(helper.getInstance().sheets[0].rows[1].cells[4].validation).toBeUndefined();
                helper.editInUI('30');
                expect(helper.getElements('.e-validationerror-dlg.e-dialog').length).toBe(0);
                done();
            });
        });

        it('Dialog interaction', (done: Function) => {
            helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
            setTimeout(() => {
                helper.click('.e-datavalidation-ddb li:nth-child(1)');
                setTimeout(() => {
                    let ddlElem: any = helper.getElements('.e-datavalidation-dlg .e-allow .e-dropdownlist')[0];
                    ddlElem.ej2_instances[0].dropDownClick({ preventDefault: function () { }, target: ddlElem.parentElement });
                    setTimeout(() => {
                        helper.click('.e-ddl.e-popup li:nth-child(5)');
                        ddlElem = helper.getElements('.e-datavalidation-dlg .e-data .e-dropdownlist')[0];
                        ddlElem.ej2_instances[0].dropDownClick({ preventDefault: function () { }, target: ddlElem.parentElement });
                        setTimeout(() => {
                            helper.click('.e-ddl.e-popup li:nth-child(3)');
                            helper.triggerKeyNativeEvent(9);
                            helper.getElements('.e-datavalidation-dlg .e-values .e-input')[0].value = 'dumm';
                            helper.triggerKeyEvent('keyup', 89, null, null, null, helper.getElements('.e-datavalidation-dlg .e-values e-input')[0]);
                            helper.setAnimationToNone('.e-datavalidation-dlg.e-dialog');
                            // helper.click('.e-datavalidation-dlg .e-footer-content button:nth-child(2)'); // This case need to be fixed
                            // expect(helper.getElements('.e-datavalidation-dlg .e-values .e-dlg-error')[0].textContent).toBe('Please enter a correct value.'); // This case need to be fixed
                            helper.getElements('.e-datavalidation-dlg .e-values .e-input')[0].value = '3';
                            helper.click('.e-datavalidation-dlg .e-footer-content button:nth-child(2)');
                            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[4].validation)).toBe('{"type":"TextLength","operator":"EqualTo","value1":"3","value2":"","ignoreBlank":true,"inCellDropDown":null}');
                            done();
                        });
                    });
                });
            });
        });

        it('Add list validation for range', (done: Function) => {
            helper.invoke('addDataValidation', [{ type: 'List', value1: '=G2:G6' }, 'D2']);
            const cell: CellModel = helper.getInstance().sheets[0].rows[1].cells[3];
            expect(JSON.stringify(cell.validation)).toBe('{"type":"List","value1":"=G2:G6"}');
            helper.invoke('selectRange', ['D2']);
            const td: HTMLElement = helper.invoke('getCell', [1, 3]).children[0];
            expect(td.classList).toContain('e-validation-list');
            const coords: ClientRect = td.getBoundingClientRect();
            helper.triggerMouseAction('mousedown', { x: coords.left, y: coords.top }, document, td);
            helper.triggerMouseAction('mouseup', { x: coords.left, y: coords.top }, document, td);
            (td.querySelector('.e-dropdownlist') as any).ej2_instances[0].dropDownClick({ preventDefault: function () { }, target: td.children[0] });
            setTimeout(() => {
                helper.click('.e-ddl.e-popup li:nth-child(4)');
                setTimeout(() => {
                    expect(helper.getInstance().sheets[0].rows[1].cells[3].value).toBe(11); // Check this now
                    expect(helper.invoke('getCell', [1, 3]).innerText).toBe('11'); // check this now
                    helper.editInUI('10');
                    setTimeout(() => {
                        expect(helper.getElements('.e-validationerror-dlg.e-dialog').length).toBe(0);
                        done();
                    });
                });
            });
        });

        it('Add list validation for range of Whole column', (done: Function) => {
            helper.invoke('selectRange', ['I1']);
            helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
            setTimeout(() => {
                helper.click('.e-datavalidation-ddb li:nth-child(1)');
                setTimeout(() => {
                    let ddlElem: any = helper.getElements('.e-datavalidation-dlg .e-allow .e-dropdownlist')[0];
                    ddlElem.ej2_instances[0].value = 'List';
                    ddlElem.ej2_instances[0].dataBind();
                    helper.getElements('.e-datavalidation-dlg .e-values .e-input')[0].value = '=G:G';
                    helper.setAnimationToNone('.e-datavalidation-dlg.e-dialog');
                    helper.click('.e-datavalidation-dlg .e-footer-content button:nth-child(2)');
                    expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8].validation)).toBe('{"type":"List","operator":"Between","value1":"=G:G","value2":"","ignoreBlank":true,"inCellDropDown":true}');
                    const td: HTMLElement = helper.invoke('getCell', [0, 8]).children[0];
                    (td.querySelector('.e-dropdownlist') as any).ej2_instances[0].dropDownClick({ preventDefault: function () { }, target: td.children[0] });
                    setTimeout(() => {
                        expect(helper.getElements('.e-ddl.e-popup ul')[0].textContent).toBe('Discount15711101336129');
                        helper.click('.e-ddl.e-popup li:nth-child(4)');
                        done();
                    });
                });
            });
        });

        it('Highlight invalid data after applying whole column validation', (done: Function) => {
            helper.click(`#${helper.id}_datavalidation`);
            helper.click('.e-datavalidation-ddb li:nth-child(2)');
            const sheet: SheetModel = helper.getInstance().getActiveSheet();
            const td: HTMLElement = helper.invoke('getCell', [1, 4]);
            expect(getCell(1, 4, sheet).validation.isHighlighted).toBeTruthy();
            expect(td.style.backgroundColor).toBe('rgb(255, 255, 0)');
            expect(td.style.color).toBe('rgb(255, 0, 0)');
            done();
        });

        it('Clear Highlight after applying whole column validation', (done: Function) => {
            helper.click(`#${helper.id}_datavalidation`);
            helper.click('.e-datavalidation-ddb li:nth-child(3)');
            const sheet: SheetModel = helper.getInstance().getActiveSheet();
            const td: HTMLElement = helper.invoke('getCell', [1, 4]);
            expect(getCell(1, 4, sheet).validation.isHighlighted).toBeFalsy();
            expect(td.style.backgroundColor).toBe('rgb(255, 255, 255)');
            expect(td.style.color).toBe('rgb(0, 0, 0)');
            done();
        });

        it('Whole number with negative value', (done: Function) => {
            helper.invoke('selectRange', ['H2']);
            helper.click(`#${helper.id}_datavalidation`);
            helper.click('.e-datavalidation-ddb li:nth-child(1)');
            setTimeout(() => {
                helper.getElement('.e-datavalidation-dlg #minvalue').value = '-10';
                helper.getElement('.e-datavalidation-dlg #maxvalue').value = '-5';
                helper.setAnimationToNone('.e-datavalidation-dlg.e-dialog');
                helper.click('.e-datavalidation-dlg .e-footer-content .e-primary');
                expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[7].validation)).toBe('{"type":"WholeNumber","operator":"Between","value1":"-10","value2":"-5","ignoreBlank":true,"inCellDropDown":null}');
                helper.editInUI('5');
                setTimeout(() => {
                    expect(helper.getElements('.e-validationerror-dlg.e-dialog').length).toBe(1);
                    helper.setAnimationToNone('.e-validationerror-dlg.e-dialog');
                    helper.click('.e-validationerror-dlg .e-footer-content button:nth-child(2)');
                    expect(helper.invoke('getCell', [1, 7]).textContent).toBe('10');
                    helper.editInUI('-5');
                    setTimeout(() => {
                        expect(helper.getElements('.e-validationerror-dlg.e-dialog').length).toBe(0);
                        expect(helper.invoke('getCell', [1, 7]).textContent).toBe('-5');
                        done();
                    });
                });
            });
        });

        it('Text length does not accept negative value', (done: Function) => {
            helper.invoke('selectRange', ['H2']);
            helper.click(`#${helper.id}_datavalidation`);
            helper.click('.e-datavalidation-ddb li:nth-child(1)');
            setTimeout(() => {
                const ddlObj : DropDownList = getComponent(helper.getElement('.e-datavalidation-dlg .e-allow .e-dropdownlist'), 'dropdownlist');
                ddlObj.value = 'Text Length';
                ddlObj.dataBind();
                helper.getElement('.e-datavalidation-dlg .e-minimum input').value = '-10';
                helper.getElement('.e-datavalidation-dlg .e-maximum input').value = '-5';
                helper.setAnimationToNone('.e-datavalidation-dlg.e-dialog');
                helper.click('.e-datavalidation-dlg .e-footer-content .e-primary');
                expect(helper.getElement('.e-datavalidation-dlg .e-dlg-error').textContent).toBe('Please enter a correct value.');
                helper.click('.e-datavalidation-dlg .e-footer-content button:nth-child(3)');
                expect(helper.getElement('.e-datavalidation-dlg.e-dialog')).toBeNull();
                done();
            });
        });

        it('Undo on cell format removes data validation', (done: Function) => {
            helper.invoke('selectRange', ['E2']);
            helper.switchRibbonTab(1);
            helper.click('#' + helper.id + '_bold');
            helper.click('#' + helper.id + '_undo');
            const cell: CellModel = helper.getInstance().sheets[0].rows[1].cells[4];
            expect(JSON.stringify(cell.validation)).toBe('{"type":"TextLength","operator":"EqualTo","value1":"3","value2":"","ignoreBlank":true,"inCellDropDown":null,"isHighlighted":false}');
            expect(cell.style).toBeNull();
            expect(helper.invoke('getCell', [1, 4]).style.fontWeight).toBe('');
            done();
        });
    });
 
    describe('Add list validation and remove list validation ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    ranges: [{
                        dataSource: defaultData
                    }],
                }]
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Add list validation and remove list validation', (done: Function) => {
            helper.invoke('addDataValidation', [{ type: 'List', value1: '12,13,14' }, 'D2']);
            const cell: CellModel = helper.getInstance().sheets[0].rows[1].cells[3];
            expect(JSON.stringify(cell.validation)).toBe('{"type":"List","value1":"12,13,14"}');
            helper.invoke('selectRange', ['D2']);
            helper.switchRibbonTab(4);
            helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
            setTimeout(() => {
                helper.click('.e-datavalidation-ddb li:nth-child(4)');
                expect(JSON.stringify(cell.validation)).toBeUndefined();
            done();
            });
        });
    });
    describe('Open pop up and then destroy spreadsheet ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    ranges: [{
                        dataSource: defaultData
                    }],
                }]
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Open pop up and then destroy spreadsheet', (done: Function) => {
            helper.invoke('selectRange', ['E3:E2']);
            helper.switchRibbonTab(4);
            helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
            setTimeout(() => {
            helper.invoke('destroy');
            expect(document.getElementById('Spreadsheet') as HTMLElement).toBeNull;
            done();
            });
        });
    });
    describe('Keyup handler other than code 13 ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    ranges: [{
                        dataSource: defaultData
                    }],
                }]
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Keyup handler other than code 13', (done: Function) => {
            helper.invoke('selectRange', ['E3:E2']);
            helper.switchRibbonTab(4);
            helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
            setTimeout(() => {
                helper.click('.e-datavalidation-ddb li:nth-child(1)');
                setTimeout(() => {
                    (helper.getElements('.e-datavalidation-dlg input')[3] as HTMLInputElement).value = 's';
                    (helper.getElements('.e-datavalidation-dlg input')[4] as HTMLInputElement).value = 'q';
                    helper.triggerKeyEvent('keyup', 110, null, null, null, (helper.getElements('.e-datavalidation-dlg input')[3] as HTMLInputElement));
                    var btnElem = (helper.getElements('.e-datavalidation-dlg .e-primary')[0] as HTMLInputElement).disabled;
                    expect(btnElem).toBeFalsy();
                    helper.click('.e-datavalidation-dlg .e-primary');
                    setTimeout(() => {
                    btnElem = (helper.getElements('.e-datavalidation-dlg .e-primary')[0] as HTMLInputElement).disabled;
                    expect(btnElem).toBeTruthy();
                    var errorElem = (helper.getElements('.e-datavalidation-dlg .e-dlg-error')[0] as HTMLInputElement).textContent;
                    expect(errorElem).toBe('Please enter a correct value.');
                    done();
                    });
                });
            });
        });
    });
    describe('Open popup ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    ranges: [{
                        dataSource: defaultData
                    }],
                }]
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Open popup', (done: Function) => {
            helper.invoke('addDataValidation', [{ type: 'List', value1: '12,13,14' }, 'D2']);
            helper.invoke('selectRange', ['D2']);
            var td = helper.invoke('getCell', [1, 3]);
            const td1: HTMLElement = helper.invoke('getCell', [1, 3]).children[0];
            (td1.querySelector('.e-dropdownlist') as any).ej2_instances[0].dropDownClick({ preventDefault: function () { }, target: td1.children[0] });
            setTimeout(() => {
                (helper.getElements('.e-list-item')[0] as HTMLElement) .click();
            done(); 
            });          
        });
    });
describe('Defined name with Open popup ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    ranges: [{
                        dataSource: defaultData
                    }],
                }]
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Defined name with Open popup', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.addDefinedName({name: 'value', refersTo: '=Sheet1!D2:D5'});
            helper.invoke('addDataValidation', [{ type: 'List', value1: '=value' }, 'E2']);
            helper.invoke('selectRange', ['E2']);
            const td1: HTMLElement = helper.invoke('getCell', [1, 4]).children[0];
            (td1.querySelector('.e-dropdownlist') as any).ej2_instances[0].dropDownClick({ preventDefault: function () { }, target: td1.children[0] });
            setTimeout(() => {
            var popupLength=document.getElementsByClassName('e-list-parent').length;
            expect(popupLength).toBe(1);
            (helper.getElements('.e-list-item')[0] as HTMLElement) .click();
            done();    
            });  
        });  
});
describe('Defined name - text with apostofe ->', () => {
    beforeAll((done: Function) => {
        helper.initializeSpreadsheet({
            sheets: [{
                ranges: [{
                    dataSource: defaultData
                }],
            }]
        }, done);
    });
    afterAll(() => {
        helper.invoke('destroy');
    });
    it('Defined name - text with apostofe', (done: Function) => {
        helper.edit('D3','2"0');
        helper.triggerKeyNativeEvent(13);
        const spreadsheet: Spreadsheet = helper.getInstance();
        spreadsheet.addDefinedName({name: 'value', refersTo: '=Sheet1!D2:D5'});
        helper.invoke('selectRange', ['A1']);
        helper.switchRibbonTab(4);
        helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
        setTimeout(() => {
            helper.click('.e-datavalidation-ddb li:nth-child(1)');
            setTimeout(() => {
                let ddlElem: any = helper.getElements('.e-datavalidation-dlg .e-allow .e-dropdownlist')[0];
                ddlElem.ej2_instances[0].value = 'List';
                ddlElem.ej2_instances[0].dataBind();
                helper.getElements('.e-datavalidation-dlg .e-values .e-input')[0].value = '=value';
                helper.setAnimationToNone('.e-datavalidation-dlg.e-dialog');
                helper.click('.e-datavalidation-dlg .e-footer-content button:nth-child(2)');
                expect(JSON.stringify(helper.getInstance().sheets[0].rows[3].cells[3].validation)).toBe('{"type":"List","operator":"Between","value1":"=value","value2":"","ignoreBlank":true,"inCellDropDown":true}');
                done(); 
    });     
    });
});
});

    describe('Defined name with Open popup - without scrolling->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    ranges: [{
                        dataSource: defaultData
                    }],
                }]
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Defined name with Open popup - without scrolling', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.addDefinedName({name: 'value', refersTo: '=Sheet1!D50:D55'})
            helper.invoke('addDataValidation', [{ type: 'List', value1: '=value' }, 'E2']);
            helper.invoke('selectRange', ['E2']);
            const td1: HTMLElement = helper.invoke('getCell', [1, 4]).children[0];
            (td1.querySelector('.e-dropdownlist') as any).ej2_instances[0].dropDownClick({ preventDefault: function () { }, target: td1.children[0] });
            setTimeout(() => {
            var popupLength=document.getElementsByClassName('e-list-parent').length;
            expect(popupLength).toBe(1);
            (helper.getElements('.e-list-item')[0] as HTMLElement) .click();
            done();  
            });         
        });
    });
   
    describe('List validation for row->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    ranges: [{
                        dataSource: defaultData
                    }],
                }]
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('List validation for row', (done: Function) => {
            helper.invoke('selectRange', ['I1']);
            helper.switchRibbonTab(4);
            helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
            setTimeout(() => {
                helper.click('.e-datavalidation-ddb li:nth-child(1)');
                setTimeout(() => {
                    let ddlElem: any = helper.getElements('.e-datavalidation-dlg .e-allow .e-dropdownlist')[0];
                    ddlElem.ej2_instances[0].value = 'List';
                    ddlElem.ej2_instances[0].dataBind();
                    helper.getElements('.e-datavalidation-dlg .e-values .e-input')[0].value = '=3:3';
                    helper.setAnimationToNone('.e-datavalidation-dlg.e-dialog');
                    helper.click('.e-datavalidation-dlg .e-footer-content button:nth-child(2)');
                    expect(JSON.stringify(helper.getInstance().sheets[0].rows[0].cells[8].validation)).toBe('{"type":"List","operator":"Between","value1":"=3:3","value2":"","ignoreBlank":true,"inCellDropDown":true}');
                    const td: HTMLElement = helper.invoke('getCell', [0, 8]).children[0];
                    (td.querySelector('.e-dropdownlist') as any).ej2_instances[0].dropDownClick({ preventDefault: function () { }, target: td.children[0] });
                        expect(helper.getElements('.e-ddl.e-popup ul')[0].textContent).toBe('Sports Shoes6/11/20145:56:32 AM2030600550');
                        helper.click('.e-ddl.e-popup li:nth-child(4)');
                        done();
                });
            });
        });
    });
    describe('ProtectSheet with Listvalidation ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    ranges: [{
                        dataSource: defaultData
                    }],
                }]
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('ProtectSheet with Listvalidation', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.addDefinedName({ name: 'value', refersTo: '=Sheet1!D2:D5' });
            helper.invoke('addDataValidation', [{ type: 'List', value1: '=value' }, 'E2']);
            helper.invoke('selectRange', ['E2']);
            helper.switchRibbonTab(4);
            spreadsheet.protectSheet('Price Details', { selectCells: true });
            const ddlObj: any = getComponent(helper.invoke('getCell', [1, 4]).querySelector('.e-dropdownlist'), 'dropdownlist');
            ddlObj.showPopup();
            setTimeout(() => {
                expect(helper.getElement('#' + helper.id + '_protect').textContent).toBe('Unprotect Sheet');
                (helper.getElements('.e-list-item')[0] as HTMLElement).click();
                expect(helper.getElements('.e-editAlert-dlg.e-dialog').length).toBe(1);
                done();
            });       
        });
    });
    describe('Full column selection with Listvalidation ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    ranges: [{
                        dataSource: defaultData
                    }],
                }]
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Full column selection with Listvalidation', (done: Function) => {
            helper.invoke('selectRange', ['A2:A200']);
            helper.switchRibbonTab(4);
            helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
            setTimeout(() => {
                helper.click('.e-datavalidation-ddb li:nth-child(1)');
                setTimeout(() => {
                    let ddlElem: any = helper.getElements('.e-datavalidation-dlg .e-allow .e-dropdownlist')[0];
                    ddlElem.ej2_instances[0].value = 'List';
                    ddlElem.ej2_instances[0].dataBind();
                    helper.getElements('.e-datavalidation-dlg .e-values .e-input')[0].value = '11,12,13';
                    helper.setAnimationToNone('.e-datavalidation-dlg.e-dialog');
                    helper.click('.e-datavalidation-dlg .e-footer-content button:nth-child(2)');
                    expect(JSON.stringify(helper.getInstance().sheets[0].rows[199].cells[0].validation)).toBe('{"type":"List","operator":"Between","value1":"11,12,13","value2":"","ignoreBlank":true,"inCellDropDown":true}');
                    helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
                    setTimeout(() => {
                        helper.click('.e-datavalidation-ddb li:nth-child(1)');
                        helper.click('.e-datavalidation-dlg .e-clearall-btn');
                        helper.click('.e-datavalidation-dlg .e-footer-content button:nth-child(2)');
                        setTimeout(() => {
                            expect(JSON.stringify(helper.getInstance().sheets[0].rows[199].cells[0].validation)).toBe('{"type":"WholeNumber","operator":"Between","value1":"0","value2":"0","ignoreBlank":true,"inCellDropDown":null}');
                            done();
                        });
                    });
                });
        });
    });
});

describe('Key press in datavalidation dialog input ->', () => {
    beforeAll((done: Function) => {
        helper.initializeSpreadsheet({
            sheets: [{
                ranges: [{
                    dataSource: defaultData
                }],
            }]
        }, done);
    });
    afterAll(() => {
        helper.invoke('destroy');
    });
    it('Key press in datavalidation dialog input', (done: Function) => {
        helper.invoke('selectRange', ['A2:A5']);
        helper.switchRibbonTab(4);
        helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
        setTimeout(() => {
            helper.click('.e-datavalidation-ddb li:nth-child(1)');
            setTimeout(() => {
                let ddlElem: any = helper.getElements('.e-datavalidation-dlg .e-allow .e-dropdownlist')[0];
                ddlElem.ej2_instances[0].value = 'List';
                ddlElem.ej2_instances[0].dataBind();
                helper.click('.e-datavalidation-dlg .e-footer-content button:nth-child(2)');
                var btnElem = helper.getElements('.e-datavalidation-dlg .e-primary')[0].disabled;
                expect(btnElem).toBeTruthy();
                helper.triggerKeyEvent('keyup', 110, null, null, null, helper.getElements('.e-datavalidation-dlg .e-values .e-input')[0]);
                helper.setAnimationToNone('.e-datavalidation-dlg.e-dialog');
                helper.getElements('.e-datavalidation-dlg .e-values .e-input')[0].value = '11,12,13';
                btnElem = helper.getElements('.e-datavalidation-dlg .e-primary')[0].disabled;
                expect(btnElem).toBeFalsy();
                helper.click('.e-datavalidation-dlg .e-footer-content button:nth-child(2)');
                done();
            });
        });
    });
    it('Double click to open pop up', (done: Function) => {
        helper.invoke('selectRange', ['A3']);
        let td: HTMLElement = helper.invoke('getCell', [2,0]);
                let coords: ClientRect = td.getBoundingClientRect();
                helper.triggerMouseAction('dblclick', { x: coords.left, y: coords.top }, null, td);
                setTimeout(() => {
                    helper.getElements('#spreadsheetlistValid_options .e-list-item')[0].click();
                    setTimeout(() => {
                        helper.invoke('selectRange', ['C3']);
                    expect(helper.invoke('getCell', [2,0]).textContent).toBe('11');
                    done();
                    });
                });
            });
});
describe('Providing formula in value1 and value2 input ->', () => {
    beforeAll((done: Function) => {
        helper.initializeSpreadsheet({
            sheets: [{
                ranges: [{
                    dataSource: defaultData
                }],
            }]
        }, done);
    });
    afterAll(() => {
        helper.invoke('destroy');
    });
    it('Providing formula in value1 and value2 input', (done: Function) => {
        helper.invoke('selectRange', ['D2']);
        helper.switchRibbonTab(4);
            helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
            setTimeout(() => {
                helper.click('.e-datavalidation-ddb li:nth-child(1)');
                setTimeout(() => {
                    (helper.getElements('.e-datavalidation-dlg input')[3] as HTMLInputElement).value = '=SUM(10,10)';
                    (helper.getElements('.e-datavalidation-dlg input')[4] as HTMLInputElement).value = '=SUM(20,30)';
                    helper.click('.e-datavalidation-dlg .e-primary');
                    setTimeout(() => {
                        helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
                        setTimeout(() => {
                            helper.click('.e-datavalidation-ddb li:nth-child(2)');
                            let td: HTMLElement = helper.invoke('getCell', [1, 3]);
                            let coords: ClientRect = td.getBoundingClientRect();
                            helper.triggerMouseAction('dblclick', { x: coords.left, y: coords.top }, null, td);
                            helper.triggerKeyNativeEvent(13);
                            setTimeout(() => {
                                let dialog: HTMLElement = helper.getElement('.e-validationerror-dlg.e-dialog');
                                expect(!!dialog).toBeTruthy();
                                expect(dialog.querySelector('.e-dlg-content').textContent).toBe(
                                "This value doesn't match the data validation restrictions defined for the cell.");
                                helper.setAnimationToNone('.e-validationerror-dlg.e-dialog');
                                helper.click('.e-validationerror-dlg .e-footer-content button:nth-child(1)');
                                done();
                            });
                        });
                    });
                });
            });
        });
    });
describe('Equal To Datavalidation ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    ranges: [{
                        dataSource: defaultData
                    }],
                }]
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Equal To Datavalidation', (done: Function) => {
            helper.invoke('selectRange', ['D2']);
            helper.switchRibbonTab(4);
                helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
                setTimeout(() => {
                    helper.click('.e-datavalidation-ddb li:nth-child(1)');
                    setTimeout(() => {

                        let ddlElement: any = helper.getElements('.e-datavalidation-dlg .e-data .e-dropdownlist')[0];
                        ddlElement.ej2_instances[0].value = 'Equal to';
                        ddlElement.ej2_instances[0].dataBind();
                        helper.getElements('.e-datavalidation-dlg .e-values .e-input')[0].value = '30';
                        helper.setAnimationToNone('.e-datavalidation-dlg.e-dialog');
                        helper.click('.e-datavalidation-dlg .e-primary');
                        setTimeout(() => {
                            helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
                            setTimeout(() => {
                                helper.click('.e-datavalidation-ddb li:nth-child(2)');
                                let td: HTMLElement = helper.invoke('getCell', [1, 3]);
                                let coords: ClientRect = td.getBoundingClientRect();
                                helper.triggerMouseAction('dblclick', { x: coords.left, y: coords.top }, null, td);
                                helper.triggerKeyNativeEvent(13);
                                setTimeout(() => {
                                    let dialog: HTMLElement = helper.getElement('.e-validationerror-dlg.e-dialog');
                                    expect(!!dialog).toBeTruthy();
                                    expect(dialog.querySelector('.e-dlg-content').textContent).toBe(
                                    "This value doesn't match the data validation restrictions defined for the cell.");
                                    helper.setAnimationToNone('.e-validationerror-dlg.e-dialog');
                                    helper.click('.e-validationerror-dlg .e-footer-content button:nth-child(2)');
                                    setTimeout(() => {
                                        helper.invoke('selectRange', ['E3']);
                                        helper.edit('D2','30');
                                        helper.triggerKeyNativeEvent(13);
                                        setTimeout(()=> {
                                            expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[3])).toBe('{"value":30,"validation":{"type":"WholeNumber","operator":"EqualTo","value1":"30","value2":"","ignoreBlank":true,"inCellDropDown":null,"isHighlighted":true}}');
                                    done();
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});
describe('Not Equal To Datavalidation ->', () => {
    beforeAll((done: Function) => {
        helper.initializeSpreadsheet({
            sheets: [{
                ranges: [{
                    dataSource: defaultData
                }],
            }]
        }, done);
    });
    afterAll(() => {
        helper.invoke('destroy');
    });
    it('Not Equal To Datavalidation', (done: Function) => {
        helper.invoke('selectRange', ['D2']);
        helper.switchRibbonTab(4);
            helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
            setTimeout(() => {
                helper.click('.e-datavalidation-ddb li:nth-child(1)');
                setTimeout(() => {

                    let ddlElement: any = helper.getElements('.e-datavalidation-dlg .e-data .e-dropdownlist')[0];
                    ddlElement.ej2_instances[0].value = 'Not equal to';
                    ddlElement.ej2_instances[0].dataBind();
                    helper.getElements('.e-datavalidation-dlg .e-values .e-input')[0].value = '10';
                    helper.setAnimationToNone('.e-datavalidation-dlg.e-dialog');
                    helper.click('.e-datavalidation-dlg .e-primary');
                    setTimeout(() => {
                        helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
                        setTimeout(() => {
                            helper.click('.e-datavalidation-ddb li:nth-child(2)');
                            let td: HTMLElement = helper.invoke('getCell', [1, 3]);
                            let coords: ClientRect = td.getBoundingClientRect();
                            helper.triggerMouseAction('dblclick', { x: coords.left, y: coords.top }, null, td);
                            helper.triggerKeyNativeEvent(13);
                            setTimeout(() => {
                                let dialog: HTMLElement = helper.getElement('.e-validationerror-dlg.e-dialog');
                                expect(!!dialog).toBeTruthy();
                                expect(dialog.querySelector('.e-dlg-content').textContent).toBe(
                                "This value doesn't match the data validation restrictions defined for the cell.");
                                helper.setAnimationToNone('.e-validationerror-dlg.e-dialog');
                                helper.click('.e-validationerror-dlg .e-footer-content button:nth-child(2)');
                                setTimeout(() => {
                                    helper.invoke('selectRange', ['E3']);
                                    helper.edit('D2','30');
                                    helper.triggerKeyNativeEvent(13);
                                    setTimeout(()=> {
                                        expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[3])).toBe('{"value":30,"validation":{"type":"WholeNumber","operator":"NotEqualTo","value1":"10","value2":"","ignoreBlank":true,"inCellDropDown":null,"isHighlighted":true}}');
                                done();
                            });
                        });
                    });
                });
            });
        });
    });
});
});
describe('Greater Than Datavalidation ->', () => {
    beforeAll((done: Function) => {
        helper.initializeSpreadsheet({
            sheets: [{
                ranges: [{
                    dataSource: defaultData
                }],
            }]
        }, done);
    });
    afterAll(() => {
        helper.invoke('destroy');
    });
    it('Greater Than Datavalidation', (done: Function) => {
        helper.invoke('selectRange', ['D2']);
        helper.switchRibbonTab(4);
            helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
            setTimeout(() => {
                helper.click('.e-datavalidation-ddb li:nth-child(1)');
                setTimeout(() => {

                    let ddlElement: any = helper.getElements('.e-datavalidation-dlg .e-data .e-dropdownlist')[0];
                    ddlElement.ej2_instances[0].value = 'Greater than';
                    ddlElement.ej2_instances[0].dataBind();
                    helper.getElements('.e-datavalidation-dlg .e-values .e-input')[0].value = '20';
                    helper.setAnimationToNone('.e-datavalidation-dlg.e-dialog');
                    helper.click('.e-datavalidation-dlg .e-primary');
                    setTimeout(() => {
                        helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
                        setTimeout(() => {
                            helper.click('.e-datavalidation-ddb li:nth-child(2)');
                            let td: HTMLElement = helper.invoke('getCell', [1, 3]);
                            let coords: ClientRect = td.getBoundingClientRect();
                            helper.triggerMouseAction('dblclick', { x: coords.left, y: coords.top }, null, td);
                            helper.triggerKeyNativeEvent(13);
                            setTimeout(() => {
                                let dialog: HTMLElement = helper.getElement('.e-validationerror-dlg.e-dialog');
                                expect(!!dialog).toBeTruthy();
                                expect(dialog.querySelector('.e-dlg-content').textContent).toBe(
                                "This value doesn't match the data validation restrictions defined for the cell.");
                                helper.setAnimationToNone('.e-validationerror-dlg.e-dialog');
                                helper.click('.e-validationerror-dlg .e-footer-content button:nth-child(2)');
                                setTimeout(() => {
                                    helper.invoke('selectRange', ['E3']);
                                    helper.edit('D2','30');
                                    helper.triggerKeyNativeEvent(13);
                                    setTimeout(()=> {
                                        expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[3])).toBe('{"value":30,"validation":{"type":"WholeNumber","operator":"GreaterThan","value1":"20","value2":"","ignoreBlank":true,"inCellDropDown":null,"isHighlighted":true}}');
                                done();
                            });
                        });
                    });
                });
            });
        });
    });
});
});
describe('Less Than Datavalidation ->', () => {
    beforeAll((done: Function) => {
        helper.initializeSpreadsheet({
            sheets: [{
                ranges: [{
                    dataSource: defaultData
                }],
            }]
        }, done);
    });
    afterAll(() => {
        helper.invoke('destroy');
    });
    it('Lesss Than Datavalidation', (done: Function) => {
        helper.invoke('selectRange', ['D2']);
        helper.switchRibbonTab(4);
            helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
            setTimeout(() => {
                helper.click('.e-datavalidation-ddb li:nth-child(1)');
                setTimeout(() => {

                    let ddlElement: any = helper.getElements('.e-datavalidation-dlg .e-data .e-dropdownlist')[0];
                    ddlElement.ej2_instances[0].value = 'Less than';
                    ddlElement.ej2_instances[0].dataBind();
                    helper.getElements('.e-datavalidation-dlg .e-values .e-input')[0].value = '10';
                    helper.setAnimationToNone('.e-datavalidation-dlg.e-dialog');
                    helper.click('.e-datavalidation-dlg .e-primary');
                    setTimeout(() => {
                        helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
                        setTimeout(() => {
                            helper.click('.e-datavalidation-ddb li:nth-child(2)');
                            let td: HTMLElement = helper.invoke('getCell', [1, 3]);
                            let coords: ClientRect = td.getBoundingClientRect();
                            helper.triggerMouseAction('dblclick', { x: coords.left, y: coords.top }, null, td);
                            helper.triggerKeyNativeEvent(13);
                            setTimeout(() => {
                                let dialog: HTMLElement = helper.getElement('.e-validationerror-dlg.e-dialog');
                                expect(!!dialog).toBeTruthy();
                                expect(dialog.querySelector('.e-dlg-content').textContent).toBe(
                                "This value doesn't match the data validation restrictions defined for the cell.");
                                helper.setAnimationToNone('.e-validationerror-dlg.e-dialog');
                                helper.click('.e-validationerror-dlg .e-footer-content button:nth-child(2)');
                                setTimeout(() => {
                                    helper.invoke('selectRange', ['E3']);
                                    helper.edit('D2','9');
                                    helper.triggerKeyNativeEvent(13);
                                    setTimeout(()=> {
                                        expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[3])).toBe('{"value":9,"validation":{"type":"WholeNumber","operator":"LessThan","value1":"10","value2":"","ignoreBlank":true,"inCellDropDown":null,"isHighlighted":true}}');
                                done();
                            });
                        });
                    });
                });
            });
        });
    });
});
});
describe('Greater Than or equal to Datavalidation ->', () => {
    beforeAll((done: Function) => {
        helper.initializeSpreadsheet({
            sheets: [{
                ranges: [{
                    dataSource: defaultData
                }],
            }]
        }, done);
    });
    afterAll(() => {
        helper.invoke('destroy');
    });
    it('Greater Than or equal to Datavalidation', (done: Function) => {
        helper.invoke('selectRange', ['D2']);
        helper.switchRibbonTab(4);
            helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
            setTimeout(() => {
                helper.click('.e-datavalidation-ddb li:nth-child(1)');
                setTimeout(() => {

                    let ddlElement: any = helper.getElements('.e-datavalidation-dlg .e-data .e-dropdownlist')[0];
                    ddlElement.ej2_instances[0].value = 'Greater than or equal to';
                    ddlElement.ej2_instances[0].dataBind();
                    helper.getElements('.e-datavalidation-dlg .e-values .e-input')[0].value = '20';
                    helper.setAnimationToNone('.e-datavalidation-dlg.e-dialog');
                    helper.click('.e-datavalidation-dlg .e-primary');
                    setTimeout(() => {
                        helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
                        setTimeout(() => {
                            helper.click('.e-datavalidation-ddb li:nth-child(2)');
                            let td: HTMLElement = helper.invoke('getCell', [1, 3]);
                            let coords: ClientRect = td.getBoundingClientRect();
                            helper.triggerMouseAction('dblclick', { x: coords.left, y: coords.top }, null, td);
                            helper.triggerKeyNativeEvent(13);
                            setTimeout(() => {
                                let dialog: HTMLElement = helper.getElement('.e-validationerror-dlg.e-dialog');
                                expect(!!dialog).toBeTruthy();
                                expect(dialog.querySelector('.e-dlg-content').textContent).toBe(
                                "This value doesn't match the data validation restrictions defined for the cell.");
                                helper.setAnimationToNone('.e-validationerror-dlg.e-dialog');
                                helper.click('.e-validationerror-dlg .e-footer-content button:nth-child(2)');
                                setTimeout(() => {
                                    helper.invoke('selectRange', ['E3']);
                                    helper.edit('D2','20');
                                    helper.triggerKeyNativeEvent(13);
                                    setTimeout(()=> {
                                        expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[3])).toBe('{"value":20,"validation":{"type":"WholeNumber","operator":"GreaterThanOrEqualTo","value1":"20","value2":"","ignoreBlank":true,"inCellDropDown":null,"isHighlighted":true}}');
                                done();
                            });
                        });
                    });
                });
            });
        });
    });
});
});
describe('Less Than or equal to Datavalidation ->', () => {
    beforeAll((done: Function) => {
        helper.initializeSpreadsheet({
            sheets: [{
                ranges: [{
                    dataSource: defaultData
                }],
            }]
        }, done);
    });
    afterAll(() => {
        helper.invoke('destroy');
    });
    it('Less Than or equal to Datavalidation', (done: Function) => {
        helper.invoke('selectRange', ['D2']);
        helper.switchRibbonTab(4);
            helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
            setTimeout(() => {
                helper.click('.e-datavalidation-ddb li:nth-child(1)');
                setTimeout(() => {

                    let ddlElement: any = helper.getElements('.e-datavalidation-dlg .e-data .e-dropdownlist')[0];
                    ddlElement.ej2_instances[0].value = 'Less than or equal to';
                    ddlElement.ej2_instances[0].dataBind();
                    helper.getElements('.e-datavalidation-dlg .e-values .e-input')[0].value = '5';
                    helper.setAnimationToNone('.e-datavalidation-dlg.e-dialog');
                    helper.click('.e-datavalidation-dlg .e-primary');
                    setTimeout(() => {
                        helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
                        setTimeout(() => {
                            helper.click('.e-datavalidation-ddb li:nth-child(2)');
                            let td: HTMLElement = helper.invoke('getCell', [1, 3]);
                            let coords: ClientRect = td.getBoundingClientRect();
                            helper.triggerMouseAction('dblclick', { x: coords.left, y: coords.top }, null, td);
                            helper.triggerKeyNativeEvent(13);
                            setTimeout(() => {
                                let dialog: HTMLElement = helper.getElement('.e-validationerror-dlg.e-dialog');
                                expect(!!dialog).toBeTruthy();
                                expect(dialog.querySelector('.e-dlg-content').textContent).toBe(
                                "This value doesn't match the data validation restrictions defined for the cell.");
                                helper.setAnimationToNone('.e-validationerror-dlg.e-dialog');
                                helper.click('.e-validationerror-dlg .e-footer-content button:nth-child(2)');
                                setTimeout(() => {
                                    helper.invoke('selectRange', ['E3']);
                                    helper.edit('D2','5');
                                    helper.triggerKeyNativeEvent(13);
                                    setTimeout(()=> {
                                        expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[3])).toBe('{"value":5,"validation":{"type":"WholeNumber","operator":"LessThanOrEqualTo","value1":"5","value2":"","ignoreBlank":true,"inCellDropDown":null,"isHighlighted":true}}');
                                done();
                            });
                        });
                    });
                });
            });
        });
    });
});
});
describe('NotBetween Datavalidation ->', () => {
    beforeAll((done: Function) => {
        helper.initializeSpreadsheet({
            sheets: [{
                ranges: [{
                    dataSource: defaultData
                }],
            }]
        }, done);
    });
    afterAll(() => {
        helper.invoke('destroy');
    });
    it('NotBetween Datavalidation', (done: Function) => {
        helper.invoke('selectRange', ['D2']);
        helper.switchRibbonTab(4);
            helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
            setTimeout(() => {
                helper.click('.e-datavalidation-ddb li:nth-child(1)');
                setTimeout(() => {

                    let ddlElement: any = helper.getElements('.e-datavalidation-dlg .e-data .e-dropdownlist')[0];
                    ddlElement.ej2_instances[0].value = 'Not between';
                    ddlElement.ej2_instances[0].dataBind();
                    helper.getElements('.e-datavalidation-dlg .e-input')[3].value = '5';
                    helper.getElements('.e-datavalidation-dlg .e-input')[4].value = '15';
                    helper.setAnimationToNone('.e-datavalidation-dlg.e-dialog');
                    helper.click('.e-datavalidation-dlg .e-primary');
                    setTimeout(() => {
                        helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
                        setTimeout(() => {
                            helper.click('.e-datavalidation-ddb li:nth-child(2)');
                            let td: HTMLElement = helper.invoke('getCell', [1, 3]);
                            let coords: ClientRect = td.getBoundingClientRect();
                            helper.triggerMouseAction('dblclick', { x: coords.left, y: coords.top }, null, td);
                            helper.triggerKeyNativeEvent(13);
                            setTimeout(() => {
                                let dialog: HTMLElement = helper.getElement('.e-validationerror-dlg.e-dialog');
                                expect(!!dialog).toBeTruthy();
                                expect(dialog.querySelector('.e-dlg-content').textContent).toBe(
                                "This value doesn't match the data validation restrictions defined for the cell.");
                                helper.setAnimationToNone('.e-validationerror-dlg.e-dialog');
                                helper.click('.e-validationerror-dlg .e-footer-content button:nth-child(2)');
                                setTimeout(() => {
                                    helper.invoke('selectRange', ['E3']);
                                    helper.edit('D2','25');
                                    helper.triggerKeyNativeEvent(13);
                                    setTimeout(()=> {
                                        expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[3])).toBe('{"value":25,"validation":{"type":"WholeNumber","operator":"NotBetween","value1":"5","value2":"15","ignoreBlank":true,"inCellDropDown":null,"isHighlighted":true}}');
                                done();
                            });
                        });
                    });
                });
            });
        });
    });
});
});
describe('Between Datavalidation ->', () => {
    beforeAll((done: Function) => {
        helper.initializeSpreadsheet({
            sheets: [{
                ranges: [{
                    dataSource: defaultData
                }],
            }]
        }, done);
    });
    afterAll(() => {
        helper.invoke('destroy');
    });
    it('Between Datavalidation', (done: Function) => {
        helper.invoke('selectRange', ['D2']);
        helper.switchRibbonTab(4);
            helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
            setTimeout(() => {
                helper.click('.e-datavalidation-ddb li:nth-child(1)');
                setTimeout(() => {

                    let ddlElement: any = helper.getElements('.e-datavalidation-dlg .e-data .e-dropdownlist')[0];
                    ddlElement.ej2_instances[0].value = 'Between';
                    ddlElement.ej2_instances[0].dataBind();
                    helper.getElements('.e-datavalidation-dlg .e-input')[3].value = '15';
                    helper.getElements('.e-datavalidation-dlg .e-input')[4].value = '20';
                    helper.setAnimationToNone('.e-datavalidation-dlg.e-dialog');
                    helper.click('.e-datavalidation-dlg .e-primary');
                    setTimeout(() => {
                        helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
                        setTimeout(() => {
                            helper.click('.e-datavalidation-ddb li:nth-child(2)');
                            let td: HTMLElement = helper.invoke('getCell', [1, 3]);
                            let coords: ClientRect = td.getBoundingClientRect();
                            helper.triggerMouseAction('dblclick', { x: coords.left, y: coords.top }, null, td);
                            helper.triggerKeyNativeEvent(13);
                            setTimeout(() => {
                                let dialog: HTMLElement = helper.getElement('.e-validationerror-dlg.e-dialog');
                                expect(!!dialog).toBeTruthy();
                                expect(dialog.querySelector('.e-dlg-content').textContent).toBe(
                                "This value doesn't match the data validation restrictions defined for the cell.");
                                helper.setAnimationToNone('.e-validationerror-dlg.e-dialog');
                                helper.click('.e-validationerror-dlg .e-footer-content button:nth-child(2)');
                                setTimeout(() => {
                                    helper.invoke('selectRange', ['E3']);
                                    helper.edit('D2','17');
                                    helper.triggerKeyNativeEvent(13);
                                    setTimeout(()=> {
                                        expect(JSON.stringify(helper.getInstance().sheets[0].rows[1].cells[3])).toBe('{"value":17,"validation":{"type":"WholeNumber","operator":"Between","value1":"15","value2":"20","ignoreBlank":true,"inCellDropDown":null,"isHighlighted":true}}');
                                done();
                            });
                        });
                    });
                });
            });
        });
    });
});
});
describe('Equal To Datavalidation with blank cell range ->', () => {
    beforeAll((done: Function) => {
        helper.initializeSpreadsheet({
            sheets: [{
                ranges: [{
                    dataSource: defaultData
                }],
            }]
        }, done);
    });
    afterAll(() => {
        helper.invoke('destroy');
    });
    it('Equal To Datavalidation with blank cell range', (done: Function) => {
        helper.invoke('selectRange', ['D9:D13']);
            helper.switchRibbonTab(4);
            helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
            setTimeout(() => {
                helper.click('.e-datavalidation-ddb li:nth-child(1)');
                setTimeout(() => {

                    let ddlElement: any = helper.getElements('.e-datavalidation-dlg .e-data .e-dropdownlist')[0];
                    ddlElement.ej2_instances[0].value = 'Equal to';
                    ddlElement.ej2_instances[0].dataBind();
                    helper.getElements('.e-datavalidation-dlg .e-values .e-input')[0].value = '41';
                    helper.setAnimationToNone('.e-datavalidation-dlg.e-dialog');
                    helper.click('.e-datavalidation-dlg .e-primary');
                    setTimeout(() => {
                        helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
                        setTimeout(() => {
                            helper.click('.e-datavalidation-ddb li:nth-child(2)');
                                setTimeout(()=> {
                                    expect(JSON.stringify(helper.getInstance().sheets[0].rows[11].cells[3])).toBe('{"validation":{"type":"WholeNumber","operator":"EqualTo","value1":"41","value2":"","ignoreBlank":true,"inCellDropDown":null,"isHighlighted":true}}');
                                done();
                            });
                        });
                    });
                });
            });
        });
    });
    describe('Greater Than Datavalidation with blank cell range ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    ranges: [{
                        dataSource: defaultData
                    }],
                }]
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Greater Than Datavalidation with blank cell range', (done: Function) => {
            helper.invoke('selectRange', ['D9:D13']);
            helper.switchRibbonTab(4);
            helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
            setTimeout(() => {
                helper.click('.e-datavalidation-ddb li:nth-child(1)');
                setTimeout(() => {

                    let ddlElement: any = helper.getElements('.e-datavalidation-dlg .e-data .e-dropdownlist')[0];
                    ddlElement.ej2_instances[0].value = 'Greater than';
                    ddlElement.ej2_instances[0].dataBind();
                    helper.getElements('.e-datavalidation-dlg .e-values .e-input')[0].value = '45';
                    helper.setAnimationToNone('.e-datavalidation-dlg.e-dialog');
                    helper.click('.e-datavalidation-dlg .e-primary');
                    setTimeout(() => {
                        helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
                        setTimeout(() => {
                            helper.click('.e-datavalidation-ddb li:nth-child(2)');
                            setTimeout(() => {
                                expect(JSON.stringify(helper.getInstance().sheets[0].rows[11].cells[3])).toBe('{"validation":{"type":"WholeNumber","operator":"GreaterThan","value1":"45","value2":"","ignoreBlank":true,"inCellDropDown":null,"isHighlighted":true}}');
                                done();
                            });
                        });
                    });
                });
            });
        });
    });
    describe('Less Than Datavalidation with blank cell range ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    ranges: [{
                        dataSource: defaultData
                    }],
                }]
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Less Than Datavalidation with blank cell range', (done: Function) => {
            helper.invoke('selectRange', ['D9:D13']);
            helper.switchRibbonTab(4);
            helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
            setTimeout(() => {
                helper.click('.e-datavalidation-ddb li:nth-child(1)');
                setTimeout(() => {

                    let ddlElement: any = helper.getElements('.e-datavalidation-dlg .e-data .e-dropdownlist')[0];
                    ddlElement.ej2_instances[0].value = 'Less than';
                    ddlElement.ej2_instances[0].dataBind();
                    helper.getElements('.e-datavalidation-dlg .e-values .e-input')[0].value = '35';
                    helper.setAnimationToNone('.e-datavalidation-dlg.e-dialog');
                    helper.click('.e-datavalidation-dlg .e-primary');
                    setTimeout(() => {
                        helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
                        setTimeout(() => {
                            helper.click('.e-datavalidation-ddb li:nth-child(2)');
                            setTimeout(() => {
                                expect(JSON.stringify(helper.getInstance().sheets[0].rows[11].cells[3])).toBe('{"validation":{"type":"WholeNumber","operator":"LessThan","value1":"35","value2":"","ignoreBlank":true,"inCellDropDown":null,"isHighlighted":true}}');
                                done();
                            });
                        });
                    });
                });
            });
        });
    });
    describe('Greater Than or Equal To Datavalidation with blank cell range ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    ranges: [{
                        dataSource: defaultData
                    }],
                }]
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Greater Than or Equal To Datavalidation with blank cell range', (done: Function) => {
            helper.invoke('selectRange', ['D9:D13']);
            helper.switchRibbonTab(4);
            helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
            setTimeout(() => {
                helper.click('.e-datavalidation-ddb li:nth-child(1)');
                setTimeout(() => {

                    let ddlElement: any = helper.getElements('.e-datavalidation-dlg .e-data .e-dropdownlist')[0];
                    ddlElement.ej2_instances[0].value = 'Greater than or equal to';
                    ddlElement.ej2_instances[0].dataBind();
                    helper.getElements('.e-datavalidation-dlg .e-values .e-input')[0].value = '50';
                    helper.setAnimationToNone('.e-datavalidation-dlg.e-dialog');
                    helper.click('.e-datavalidation-dlg .e-primary');
                    setTimeout(() => {
                        helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
                        setTimeout(() => {
                            helper.click('.e-datavalidation-ddb li:nth-child(2)');
                            setTimeout(() => {
                                expect(JSON.stringify(helper.getInstance().sheets[0].rows[11].cells[3])).toBe('{"validation":{"type":"WholeNumber","operator":"GreaterThanOrEqualTo","value1":"50","value2":"","ignoreBlank":true,"inCellDropDown":null,"isHighlighted":true}}');
                                done();
                            });
                        });
                    });
                });
            });
        });
    });

    describe('Less Than or Equal To Datavalidation with blank cell range ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    ranges: [{
                        dataSource: defaultData
                    }],
                }]
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Less Than or Equal To Datavalidation with blank cell range', (done: Function) => {
            helper.invoke('selectRange', ['D9:D13']);
            helper.switchRibbonTab(4);
            helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
            helper.click('.e-datavalidation-ddb li:nth-child(1)');
            setTimeout(() => {
                const ddlObj: any = getComponent(helper.getElements('.e-datavalidation-dlg .e-data .e-dropdownlist')[0], 'dropdownlist');
                ddlObj.value = 'Less than or equal to';
                ddlObj.dataBind();
                helper.getElements('.e-datavalidation-dlg .e-values .e-input')[0].value = '50';
                helper.setAnimationToNone('.e-datavalidation-dlg.e-dialog');
                helper.click('.e-datavalidation-dlg .e-primary');
                helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
                helper.click('.e-datavalidation-ddb li:nth-child(2)');
                expect(JSON.stringify(helper.getInstance().sheets[0].rows[11].cells[3])).toBe('{"validation":{"type":"WholeNumber","operator":"LessThanOrEqualTo","value1":"50","value2":"","ignoreBlank":true,"inCellDropDown":null,"isHighlighted":true}}');
                done();
            });
        });
    });
    describe('Between Datavalidation with blank cell range ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    ranges: [{
                        dataSource: defaultData
                    }],
                }]
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Between Datavalidation with blank cell range', (done: Function) => {
            helper.invoke('selectRange', ['D9:D13']);
            helper.switchRibbonTab(4);
            helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
            helper.click('.e-datavalidation-ddb li:nth-child(1)');
            setTimeout(() => {
                const ddlObj: any = getComponent(helper.getElements('.e-datavalidation-dlg .e-data .e-dropdownlist')[0], 'dropdownlist');
                ddlObj.value = 'Between';
                ddlObj.dataBind();
                helper.getElements('.e-datavalidation-dlg .e-input')[3].value = '45';
                helper.getElements('.e-datavalidation-dlg .e-input')[4].value = '60';
                helper.setAnimationToNone('.e-datavalidation-dlg.e-dialog');
                helper.click('.e-datavalidation-dlg .e-primary');
                helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
                helper.click('.e-datavalidation-ddb li:nth-child(2)');
                expect(JSON.stringify(helper.getInstance().sheets[0].rows[11].cells[3])).toBe('{"validation":{"type":"WholeNumber","operator":"Between","value1":"45","value2":"60","ignoreBlank":true,"inCellDropDown":null,"isHighlighted":true}}');
                done();
            });
        });
    });
    describe('NotBetween Datavalidation with blank cell range ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    ranges: [{
                        dataSource: defaultData
                    }],
                }]
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('NotBetween Datavalidation with blank cell range', (done: Function) => {
            helper.invoke('selectRange', ['D9:D13']);
            helper.switchRibbonTab(4);
            helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
            helper.click('.e-datavalidation-ddb li:nth-child(1)');
            setTimeout(() => {
                const ddlObj: any = getComponent(helper.getElements('.e-datavalidation-dlg .e-data .e-dropdownlist')[0], 'dropdownlist');
                ddlObj.value = 'Not between';
                ddlObj.dataBind();
                helper.getElements('.e-datavalidation-dlg .e-input')[3].value = '30';
                helper.getElements('.e-datavalidation-dlg .e-input')[4].value = '45';
                helper.setAnimationToNone('.e-datavalidation-dlg.e-dialog');
                helper.click('.e-datavalidation-dlg .e-primary');
                helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
                helper.click('.e-datavalidation-ddb li:nth-child(2)');
                expect(JSON.stringify(helper.getInstance().sheets[0].rows[11].cells[3])).toBe('{"validation":{"type":"WholeNumber","operator":"NotBetween","value1":"30","value2":"45","ignoreBlank":true,"inCellDropDown":null,"isHighlighted":true}}');
                done();
            });
        });
    });
describe('Checking for Extend validation dialog ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    ranges: [{
                        dataSource: defaultData
                    }],
                }]
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Checking for Extend validation dialog', (done: Function) => {
            helper.invoke('selectRange', ['D2:D5']);
            helper.switchRibbonTab(4);
            helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
            setTimeout(() => {
                helper.click('.e-datavalidation-ddb li:nth-child(1)');
                setTimeout(() => {
                    let ddlElement: any = helper.getElements('.e-datavalidation-dlg .e-data .e-dropdownlist')[0];
                    ddlElement.ej2_instances[0].value = 'Greater than';
                    ddlElement.ej2_instances[0].dataBind();
                    helper.getElements('.e-datavalidation-dlg .e-values .e-input')[0].value = '15';
                    helper.setAnimationToNone('.e-datavalidation-dlg.e-dialog');
                    helper.click('.e-datavalidation-dlg .e-primary');
                    setTimeout(() => {
                        helper.invoke('selectRange', ['D2:D10']);
                        helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
                        setTimeout(() => {
                            helper.click('.e-datavalidation-ddb li:nth-child(1)');
                            setTimeout(() => {
                                helper.setAnimationToNone('.e-goto-dlg.e-dialog');
                                helper.click('.e-goto-dlg .e-footer-content button:nth-child(1)');
                                        done();
                                    });
                                });
                            });
                        });
                    });
                });
            });
    describe('Clicking No option in Extend validation dialog ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    ranges: [{
                        dataSource: defaultData
                    }],
                }]
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Clicking No option in Extend validation dialog', (done: Function) => {
            helper.invoke('selectRange', ['D2:D5']);
            helper.switchRibbonTab(4);
            helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
            setTimeout(() => {
                helper.click('.e-datavalidation-ddb li:nth-child(1)');
                setTimeout(() => {
                    let ddlElement: any = helper.getElements('.e-datavalidation-dlg .e-data .e-dropdownlist')[0];
                    ddlElement.ej2_instances[0].value = 'Greater than';
                    ddlElement.ej2_instances[0].dataBind();
                    helper.getElements('.e-datavalidation-dlg .e-values .e-input')[0].value = '15';
                    helper.setAnimationToNone('.e-datavalidation-dlg.e-dialog');
                    helper.click('.e-datavalidation-dlg .e-primary');
                    setTimeout(() => {
                        helper.invoke('selectRange', ['D2:D10']);
                        helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
                        setTimeout(() => {
                            helper.click('.e-datavalidation-ddb li:nth-child(1)');
                            setTimeout(() => {
                                helper.setAnimationToNone('.e-goto-dlg.e-dialog');
                                helper.getElements('.e-goto-dlg .e-primary')[1].click();
                                done();
                            });
                        });
                    });
                });
            });
        });
    });
describe('Checking for More validation dialog->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    ranges: [{
                        dataSource: defaultData
                    }],
                }]
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Checking for More validation dialog', (done: Function) => {
            const spreadsheet: Spreadsheet = helper.getInstance();
            spreadsheet.addDataValidation({ type: 'WholeNumber', operator: 'LessThanOrEqualTo', value1: '20' }, 'D:D');
            spreadsheet.addDataValidation({ type: 'WholeNumber', operator: 'EqualTo', value1: '15' }, 'D5');
            helper.invoke('selectRange', ['D5']);
            helper.switchRibbonTab(4);
            helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
            setTimeout(() => {
                helper.click('.e-datavalidation-ddb li:nth-child(1)');
                setTimeout(() => {
                    helper.setAnimationToNone('.e-goto-dlg.e-dialog');
                    helper.getElements('.e-goto-dlg .e-primary')[0].click();
                    done();
                });
            });
        });
    });
describe('Check MinMaxError in Between Datavalidation  ->', () => {
        beforeAll((done: Function) => {
            helper.initializeSpreadsheet({
                sheets: [{
                    ranges: [{
                        dataSource: defaultData
                    }],
                }]
            }, done);
        });
        afterAll(() => {
            helper.invoke('destroy');
        });
        it('Check MMinMaxError in Between Datavalidation', (done: Function) => {
            helper.invoke('selectRange', ['D9:D13']);
            helper.switchRibbonTab(4);
            helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
            setTimeout(() => {
                helper.click('.e-datavalidation-ddb li:nth-child(1)');
                setTimeout(() => {

                    let ddlElement: any = helper.getElements('.e-datavalidation-dlg .e-data .e-dropdownlist')[0];
                    ddlElement.ej2_instances[0].value = 'Between';
                    ddlElement.ej2_instances[0].dataBind();
                    helper.getElements('.e-datavalidation-dlg .e-input')[3].value = '60';
                    helper.getElements('.e-datavalidation-dlg .e-input')[4].value = '45';
                    helper.setAnimationToNone('.e-datavalidation-dlg.e-dialog');
                    helper.click('.e-datavalidation-dlg .e-primary');
                        setTimeout(() => {
                            expect(helper.getElements('.e-dlg-error')[0].textContent).toBe('The Maximum must be greater than or equal to the Minimum.');
                            done();
                        });
                    });
                });
            });
        });
describe('Check ListLengthError in List  Datavalidation  ->', () => {
            beforeAll((done: Function) => {
                helper.initializeSpreadsheet({
                    sheets: [{
                        ranges: [{
                            dataSource: defaultData
                        }],
                    }]
                }, done);
            });
            afterAll(() => {
                helper.invoke('destroy');
            });
            it('Check ListLengthError in List  Datavalidation', (done: Function) => {
                helper.invoke('selectRange', ['D9:D13']);
                helper.switchRibbonTab(4);
                helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
                setTimeout(() => {
                    helper.click('.e-datavalidation-ddb li:nth-child(1)');
                    setTimeout(() => {
                        let ddlElement: any = helper.getElements('.e-datavalidation-dlg .e-allow .e-dropdownlist')[0];
                        ddlElement.ej2_instances[0].value = 'List';
                        ddlElement.ej2_instances[0].dataBind();
                        helper.getElements('.e-datavalidation-dlg .e-input')[2].value = 'Syncfusion JavaScript (Essential JS 2) is a modern UI Controls library that has been built from the ground up to be lightweight, responsive, modular and touch friendly. It is written in TypeScript and has no external dependencies. It also includes complete support for Angular, React, Vue, ASP.NET MVC and ASP.NET Core frameworks.';
                        helper.setAnimationToNone('.e-datavalidation-dlg.e-dialog');
                        helper.click('.e-datavalidation-dlg .e-primary');
                            setTimeout(() => {
                                expect(helper.getElements('.e-dlg-error')[0].textContent).toBe('The list values allows only upto 256 charcters');
                                done();
                            });
                        });
                    });
                });
            });

    describe('CR-Issues ->', () => {
        describe('I282749, I300338, I303567, EJ2-62856 ->', () => {
            beforeEach((done: Function) => {
                helper.initializeSpreadsheet({
                    sheets: [{ ranges: [{ dataSource: [{ 'Employee ID': '', 'Employee Name': '', 'Gender': '', 'Department': '',
                    'Date of Joining': '', 'Salary': '', 'City': '' }] }], selectedRange: 'A1:A10' }],
                    created: (): void => {
                        const spreadsheet: Spreadsheet = helper.getInstance();
                        spreadsheet.cellFormat({ fontWeight: 'bold', textAlign: 'center', verticalAlign: 'middle' }, 'A1:F1');
                        spreadsheet.cellFormat({ fontWeight: 'bold' }, 'E31:F31');
                        spreadsheet.cellFormat({ textAlign: 'right' }, 'E31');
                        spreadsheet.numberFormat('$#,##0.00', 'F2:F31');
                        spreadsheet.addDataValidation(
                            { type: 'List', operator: 'Between', value1: '1,2', value2: '', ignoreBlank: true, inCellDropDown: true,
                            isHighlighted: true }, 'A2:A100');
                    }
                }, done);
            });
            afterEach(() => {
                helper.invoke('destroy');
            });
            it('Cell alignment and filtering issue ~ from 275309 (while applying data validation)', (done: Function) => {
                helper.getElement('#' + helper.id + '_sorting').click();
                helper.getElement('#' + helper.id + '_applyfilter').click();
                helper.invoke('selectRange', ['A2']);
                setTimeout((): void => {
                    let ddl: HTMLElement = helper.invoke('getCell', [1, 0]).querySelector('.e-ddl') as HTMLElement;
                    helper.triggerMouseAction('mousedown', { x: ddl.getBoundingClientRect().left + 2, y:
                        ddl.getBoundingClientRect().top + 2 }, ddl, ddl);
                    let cell: HTMLElement = helper.invoke('getCell', [1, 0]);
                    helper.triggerMouseAction(
                        'mouseup', { x: cell.getBoundingClientRect().left + 1, y: cell.getBoundingClientRect().top + 1 },
                        document, cell);
                    setTimeout((): void => {
                        helper.getElement('#' + helper.getElement().id + 'listValid_popup .e-list-item').click();
                        helper.invoke('selectRange', ['A3']);
                        setTimeout((): void => {
                            ddl = helper.invoke('getCell', [2, 0]).querySelector('.e-ddl') as HTMLElement;
                            helper.triggerMouseAction('mousedown', { x: ddl.getBoundingClientRect().left + 2, y:
                                ddl.getBoundingClientRect().top + 2 }, ddl, ddl);
                            cell = helper.invoke('getCell', [2, 0]);
                            helper.triggerMouseAction(
                                'mouseup', { x: cell.getBoundingClientRect().left + 1, y: cell.getBoundingClientRect().top + 1 },
                                document, cell);
                            setTimeout((): void => {
                                helper.getElement('#' + helper.getElement().id + 'listValid_popup .e-list-item:last-child').click();
                                helper.invoke('selectRange', ['A1']);
                                const filterCell: HTMLElement = helper.invoke('getCell', [0, 0]).querySelector('.e-filter-icon');
                                helper.triggerMouseAction(
                                    'mousedown', { x: filterCell.getBoundingClientRect().left + 1, y: filterCell.getBoundingClientRect().top + 1 },
                                    null, filterCell);
                                cell = helper.invoke('getCell', [0, 0]);
                                helper.triggerMouseAction(
                                    'mouseup', { x: cell.getBoundingClientRect().left + 1, y: cell.getBoundingClientRect().top + 1 },
                                    document, cell);
                                setTimeout((): void => {
                                    helper.getElement().getElementsByClassName('e-ftrchk')[2].click();
                                    helper.getElement('.e-excelfilter .e-footer-content .e-btn.e-primary').click();
                                    const spreadsheet: Spreadsheet = helper.getInstance();
                                    expect(spreadsheet.sheets[0].selectedRange).toBe('A1:A1');
                                    helper.invoke('selectRange', ['A4']);
                                    setTimeout((): void => {
                                        expect(!!helper.invoke('getCell', [3, 0]).querySelector('.e-validation-list')).toBeTruthy();
                                        expect(!!helper.invoke('getCell', [4, 0]).querySelector('.e-validation-list')).toBeFalsy();
                                        done();
                                    }, 101);
                                }, 100);
                            }, 10);
                        }, 10);
                    }, 10);
                }, 10);
            });
            it('Data validation list does not perform properly while editing', (done: Function) => {
                helper.invoke('addDataValidation', [{ type: 'List', value1: '1,2,3,4' }, 'H1']);
                helper.invoke('selectRange', ['H1']);
                let td: HTMLElement = helper.invoke('getCell', [0, 7]);
                let coords: ClientRect = td.getBoundingClientRect();
                helper.triggerMouseAction('dblclick', { x: coords.right, y: coords.top }, null, td);
                helper.getElement('.e-spreadsheet-edit').textContent = 'text';
                helper.triggerKeyNativeEvent(13);
                    helper.click('.e-validationerror-dlg .e-primary');
                    setTimeout(() => {
                        helper.getElement('#' + helper.id + 'listValid_options li:nth-child(1)').click();
                        expect(helper.getInstance().editModule.isEdit).toBe(false);
                        expect(helper.getInstance().sheets[0].rows[0].cells[7].value).toBe(1);
                        done();
                    });
            });
        });
        describe('I301019, I300657 ->', () => {
            beforeAll((done: Function) => {
                helper.initializeSpreadsheet(
                    { sheets: [{ rows: [{ cells: [{ value: 'Food', validation: { type: 'Decimal', operator: 'NotEqualTo', ignoreBlank: true,
                    value1: '0' } }] }], selectedRange: 'A1:A1' }] }, done);
            });
            afterAll(() => {
                helper.invoke('destroy');
            });
            it('unexcepted set validations from cellbuilder', (done: Function) => {
                helper.getElement('#' + helper.id + '_ribbon .e-tab-header .e-toolbar-item:nth-child(6)').click();
                helper.getElement('#' + helper.id + '_datavalidation').click();
                helper.getElement('#' + helper.id + '_datavalidation-popup .e-item').click();
                setTimeout((): void => { // Data validation model is not set properly in dialog.
                    let dlg: HTMLElement = helper.getElement().querySelector('.e-datavalidation-dlg.e-dialog') as HTMLElement;
                    expect(!!dlg).toBeTruthy();
                    expect((dlg.querySelector('.e-cellrange .e-input') as HTMLInputElement).value).toBe('A1:A1');
                    expect((dlg.querySelector('.e-ignoreblank .e-checkbox') as HTMLInputElement).checked).toBeTruthy();
                    (helper.getInstance().serviceLocator.getService(dialog) as Dialog).hide();
                    setTimeout((): void => {
                        done();
                    });
                });
            });
            it('custom message on spreadsheet validation', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                spreadsheet.dialogBeforeOpen = (args: DialogBeforeOpenEventArgs): void => {
                    if (args.dialogName === 'ValidationErrorDialog') { args.content = 'Invalid value'; }
                };
                spreadsheet.dataBind();
                helper.edit('A1', '0');
                setTimeout((): void => {
                    let dlg: HTMLElement = helper.getElement().querySelector('.e-validationerror-dlg.e-dialog') as HTMLElement;
                    expect(!!dlg).toBeTruthy();
                    expect(dlg.querySelector('.e-dlg-content').textContent).toBe('Invalid value');
                    (spreadsheet.serviceLocator.getService(dialog) as Dialog).hide();
                    setTimeout((): void => {
                        done();
                    });
                }, 10);
            });
        });
        describe('I275309 ->', () => {
            beforeEach((done: Function) => {
                helper.initializeSpreadsheet({
                    created: (): void => {
                        const spreadsheet: Spreadsheet = helper.getInstance();
                        spreadsheet.addDataValidation(
                            { type: 'List', operator: 'Between', value1: '1', value2:'1', ignoreBlank: true, inCellDropDown: true,
                            isHighlighted: true }, 'X1:X10');
                        spreadsheet.addDataValidation(
                            { type: 'List', operator: 'Between', value1: '2', value2:'2', ignoreBlank: true, inCellDropDown: true,
                            isHighlighted: true }, 'Y1:Y10');
                        spreadsheet.addDataValidation(
                            { type: 'List', operator: 'Between', value1: '3', value2:'3', ignoreBlank: true, inCellDropDown: true,
                            isHighlighted: true }, 'Z1:Z10');
                        spreadsheet.autoFit('1:100');
                    }
                }, done);
            });
            afterEach(() => {
                helper.invoke('destroy');
            });
            it('Dropdownlist added randomly in cells while directly scrolling the spreadsheet', (done: Function) => {
                helper.invoke('goTo', ['G1']);
                setTimeout((): void => {
                    helper.invoke('goTo', ['Q1']);
                    setTimeout((): void => {
                        helper.invoke('goTo', ['V1']);
                        helper.invoke('selectRange', ['X1']);
                        setTimeout((): void => {
                            expect(!!helper.invoke('getCell', [0, 23]).querySelector('.e-validation-list')).toBeTruthy();
                            helper.invoke('selectRange', ['Z1']);
                            setTimeout((): void => {
                                expect(!!helper.invoke('getCell', [0, 25]).querySelector('.e-validation-list')).toBeTruthy();
                                helper.invoke('selectRange', ['AA1']);
                                setTimeout((): void => {
                                    expect(!!helper.invoke('getCell', [0, 26]).querySelector('.e-validation-list')).toBeFalsy();
                                    done();
                                });
                            });
                        });
                    });
                });
            });
        });

        describe('EJ2-56780, EJ2-57644 ->', () => {
            beforeAll((done: Function) => {
                helper.initializeSpreadsheet({
                    sheets: [{
                        ranges: [{ dataSource: defaultData }],
                        rows: [{ cells: [{ index: 8, validation: { type: 'List', value1: '=A2:A5' } }] },
                        { index: 5, cells: [{ index: 3, validation: { type: 'List', value1: '1,2' } }] }]
                    }]
                }, done);
            });
            afterAll(() => {
                helper.invoke('destroy');
            });
            it('Insert row above and between the cells referred in list validation', (done: Function) => {
                helper.setAnimationToNone('#spreadsheet_contextmenu');
                const sheet: SheetModel = helper.invoke('getActiveSheet');
                // Insert above the cell reference
                helper.openAndClickCMenuItem(0, 0, [6, 1], true);
                expect(getCell(0, 8, sheet).validation.value1).toBe('=A3:A6');
                setTimeout(() => {
                    // Insert inbetween the cell reference
                    helper.invoke('selectRange', ['A3']);
                    helper.openAndClickCMenuItem(2, 0, [6, 2], true);
                    expect(getCell(0, 8, sheet).validation.value1).toBe('=A3:A7');
                    helper.invoke('selectRange', ['I1']);
                    const ddl: any = helper.invoke('getCell', [0, 8]).querySelector('.e-dropdownlist');
                    ddl.ej2_instances[0].showPopup();
                    setTimeout(() => {
                        const popup: HTMLElement = helper.getElement('.e-ddl.e-popup ul');
                        expect(popup.childElementCount).toBe(5);
                        expect(popup.children[1].textContent).toBe('');
                        ddl.ej2_instances[0].hidePopup();
                        done();
                    });
                });
            });

            it('Insert before with single column', (done: Function) => {
                const validation: string = '{"type":"List","value1":"=A3:A7","ignoreBlank":true,"inCellDropDown":true}';
                const sheet: SheetModel = helper.invoke('getActiveSheet');
                helper.invoke('selectRange', ['I1']);
                helper.openAndClickCMenuItem(0, 8, [6, 1], null, true);
                expect(JSON.stringify(getCell(0, 8, sheet).validation)).toBe(validation);
                expect(JSON.stringify(getCell(0, 9, sheet).validation)).toBe(validation);
                expect(getCell(0, 10, sheet)).toBeNull();
                done();
            });

            it('Insert before with single column - Undo & Redo', (done: Function) => {
                const validation: string = '{"type":"List","value1":"=A3:A7","ignoreBlank":true,"inCellDropDown":true}';
                const sheet: SheetModel = helper.invoke('getActiveSheet');
                helper.click('#spreadsheet_undo');
                expect(JSON.stringify(getCell(0, 8, sheet).validation)).toBe(validation);
                expect(getCell(0, 9, sheet)).toBeNull();
                helper.click('#spreadsheet_redo');
                expect(JSON.stringify(getCell(0, 8, sheet).validation)).toBe(validation);
                expect(JSON.stringify(getCell(0, 9, sheet).validation)).toBe(validation);
                done();
            });

            it('Insert after with single column', (done: Function) => {
                const validation: string = '{"type":"List","value1":"=A3:A7","ignoreBlank":true,"inCellDropDown":true}';
                const sheet: SheetModel = helper.invoke('getActiveSheet');
                helper.invoke('selectRange', ['J1']);
                helper.openAndClickCMenuItem(0, 9, [6, 2], null, true);
                expect(JSON.stringify(getCell(0, 9, sheet).validation)).toBe(validation);
                expect(JSON.stringify(getCell(0, 10, sheet).validation)).toBe(validation);
                done();
            });

            it('Insert after with single column - Undo & Redo', (done: Function) => {
                const validation: string = '{"type":"List","value1":"=A3:A7","ignoreBlank":true,"inCellDropDown":true}';
                const sheet: SheetModel = helper.invoke('getActiveSheet');
                helper.click('#spreadsheet_undo');
                expect(JSON.stringify(getCell(0, 9, sheet).validation)).toBe(validation);
                expect(getCell(0, 10, sheet)).toBeNull();
                helper.click('#spreadsheet_redo');
                expect(JSON.stringify(getCell(0, 9, sheet).validation)).toBe(validation);
                expect(JSON.stringify(getCell(0, 10, sheet).validation)).toBe(validation);
                done();
            });

            it('Insert before with mutliple column', (done: Function) => {
                const validation: string = '{"type":"List","value1":"=A3:A7","ignoreBlank":true,"inCellDropDown":true}';
                const sheet: SheetModel = helper.invoke('getActiveSheet');
                helper.invoke('selectRange', ['K1:M1']);
                helper.openAndClickCMenuItem(0, 10, [6, 1], null, true);
                expect(JSON.stringify(getCell(0, 10, sheet).validation)).toBe(validation);
                expect(JSON.stringify(getCell(0, 11, sheet).validation)).toBe(validation);
                expect(JSON.stringify(getCell(0, 12, sheet).validation)).toBe(validation);
                expect(JSON.stringify(getCell(0, 13, sheet).validation)).toBe(validation);
                done();
            });

            it('Insert before with mutliple column - Undo & Redo', (done: Function) => {
                const validation: string = '{"type":"List","value1":"=A3:A7","ignoreBlank":true,"inCellDropDown":true}';
                const sheet: SheetModel = helper.invoke('getActiveSheet');
                helper.click('#spreadsheet_undo');
                expect(JSON.stringify(getCell(0, 10, sheet).validation)).toBe(validation);
                expect(getCell(0, 11, sheet)).toBeNull();
                expect(getCell(0, 12, sheet)).toBeNull();
                expect(getCell(0, 13, sheet)).toBeNull();
                helper.click('#spreadsheet_redo');
                expect(JSON.stringify(getCell(0, 10, sheet).validation)).toBe(validation);
                expect(JSON.stringify(getCell(0, 11, sheet).validation)).toBe(validation);
                expect(JSON.stringify(getCell(0, 12, sheet).validation)).toBe(validation);
                expect(JSON.stringify(getCell(0, 13, sheet).validation)).toBe(validation);
                done();
            });

            it('Insert after with mutliple column', (done: Function) => {
                const validation: string = '{"type":"List","value1":"=A3:A7","ignoreBlank":true,"inCellDropDown":true}';
                const sheet: SheetModel = helper.invoke('getActiveSheet');
                helper.invoke('selectRange', ['L1:N1']);
                helper.openAndClickCMenuItem(0, 11, [6, 2], null, true);
                expect(JSON.stringify(getCell(0, 13, sheet).validation)).toBe(validation);
                expect(JSON.stringify(getCell(0, 14, sheet).validation)).toBe(validation);
                expect(JSON.stringify(getCell(0, 15, sheet).validation)).toBe(validation);
                expect(JSON.stringify(getCell(0, 16, sheet).validation)).toBe(validation);
                done();
            });

            it('Insert after with mutliple column - Undo & Redo', (done: Function) => {
                const validation: string = '{"type":"List","value1":"=A3:A7","ignoreBlank":true,"inCellDropDown":true}';
                const sheet: SheetModel = helper.invoke('getActiveSheet');
                helper.click('#spreadsheet_undo');
                expect(JSON.stringify(getCell(0, 13, sheet).validation)).toBe(validation);
                expect(getCell(0, 14, sheet)).toBeNull();
                expect(getCell(0, 15, sheet)).toBeNull();
                expect(getCell(0, 16, sheet)).toBeNull();
                helper.click('#spreadsheet_redo');
                expect(JSON.stringify(getCell(0, 13, sheet).validation)).toBe(validation);
                expect(JSON.stringify(getCell(0, 14, sheet).validation)).toBe(validation);
                expect(JSON.stringify(getCell(0, 15, sheet).validation)).toBe(validation);
                expect(JSON.stringify(getCell(0, 16, sheet).validation)).toBe(validation);
                done();
            });

            it('Insert before with mutliple column - not to update case', (done: Function) => {
                const sheet: SheetModel = helper.invoke('getActiveSheet');
                helper.invoke('selectRange', ['G1:I1']);
                helper.openAndClickCMenuItem(0, 6, [6, 1], null, true);
                expect(getCell(0, 6, sheet)).toBeNull();
                expect(getCell(0, 7, sheet)).toBeNull();
                expect(getCell(0, 8, sheet)).toBeNull();
                done();
            });

            it('Insert after with mutliple column - not to update case', (done: Function) => {
                const sheet: SheetModel = helper.invoke('getActiveSheet');
                helper.invoke('selectRange', ['T1:U1']);
                helper.openAndClickCMenuItem(0, 19, [6, 2], null, true);
                expect(getCell(0, 21, sheet)).toBeNull();
                expect(getCell(0, 22, sheet)).toBeNull();
                done();
            });

            it('Insert above with single row', (done: Function) => {
                const validation: string = '{"type":"List","value1":"=A4:A8"}';
                const sheet: SheetModel = helper.invoke('getActiveSheet');
                helper.invoke('selectRange', ['A2']);
                helper.openAndClickCMenuItem(1, 0, [6, 1], true);
                expect(JSON.stringify(getCell(1, 11, sheet).validation)).toBe(validation);
                expect(JSON.stringify(getCell(2, 11, sheet).validation)).toBe(validation);
                expect(getCell(3, 11, sheet)).toBeNull();
                done();
            });

            it('Insert above with single row - Undo & Redo', (done: Function) => {
                const validationAfterUndo: string = '{"type":"List","value1":"=A3:A7"}';
                const validation: string = '{"type":"List","value1":"=A4:A8"}';
                const sheet: SheetModel = helper.invoke('getActiveSheet');
                helper.click('#spreadsheet_undo');
                expect(JSON.stringify(getCell(1, 11, sheet).validation)).toBe(validationAfterUndo);
                expect(getCell(2, 11, sheet)).toBeNull();
                helper.click('#spreadsheet_redo');
                expect(JSON.stringify(getCell(1, 11, sheet).validation)).toBe(validation);
                expect(JSON.stringify(getCell(2, 11, sheet).validation)).toBe(validation);
                done();
            });

            it('Insert below with single row', (done: Function) => {
                const validation: string = '{"type":"List","value1":"=A5:A9"}';
                const sheet: SheetModel = helper.invoke('getActiveSheet');
                helper.invoke('selectRange', ['A3']);
                helper.openAndClickCMenuItem(2, 0, [6, 2], true);
                expect(JSON.stringify(getCell(2, 11, sheet).validation)).toBe(validation);
                expect(JSON.stringify(getCell(3, 11, sheet).validation)).toBe(validation);
                done();
            });

            it('Insert below with single row - Undo & Redo', (done: Function) => {
                const validationAfterUndo: string = '{"type":"List","value1":"=A4:A8"}';
                const validation: string = '{"type":"List","value1":"=A5:A9"}';
                const sheet: SheetModel = helper.invoke('getActiveSheet');
                helper.click('#spreadsheet_undo');
                expect(JSON.stringify(getCell(2, 11, sheet).validation)).toBe(validationAfterUndo);
                expect(getCell(3, 11, sheet)).toBeNull();
                helper.click('#spreadsheet_redo');
                expect(JSON.stringify(getCell(2, 11, sheet).validation)).toBe(validation);
                expect(JSON.stringify(getCell(3, 11, sheet).validation)).toBe(validation);
                done();
            });

            it('Insert above with mutliple row', (done: Function) => {
                const validation: string = '{"type":"List","value1":"1,2"}';
                const sheet: SheetModel = helper.invoke('getActiveSheet');
                helper.invoke('selectRange', ['A10:A12']);
                helper.openAndClickCMenuItem(9, 0, [6, 1], true);
                expect(JSON.stringify(getCell(9, 3, sheet).validation)).toBe(validation);
                expect(JSON.stringify(getCell(10, 3, sheet).validation)).toBe(validation);
                expect(JSON.stringify(getCell(11, 3, sheet).validation)).toBe(validation);
                expect(JSON.stringify(getCell(12, 3, sheet).validation)).toBe(validation);
                done();
            });

            it('Insert above with mutliple row - Undo & Redo', (done: Function) => {
                const validation: string = '{"type":"List","value1":"1,2"}';
                const sheet: SheetModel = helper.invoke('getActiveSheet');
                helper.click('#spreadsheet_undo');
                expect(JSON.stringify(getCell(9, 3, sheet).validation)).toBe(validation);
                expect(getCell(10, 3, sheet).validation).toBeUndefined();
                expect(getCell(11, 3, sheet).validation).toBeUndefined();
                expect(getCell(12, 3, sheet).validation).toBeUndefined();
                helper.click('#spreadsheet_redo');
                expect(JSON.stringify(getCell(9, 3, sheet).validation)).toBe(validation);
                expect(JSON.stringify(getCell(10, 3, sheet).validation)).toBe(validation);
                expect(JSON.stringify(getCell(11, 3, sheet).validation)).toBe(validation);
                expect(JSON.stringify(getCell(12, 3, sheet).validation)).toBe(validation);
                done();
            });

            it('Insert below with mutliple row', (done: Function) => {
                const validation: string = '{"type":"List","value1":"1,2"}';
                const sheet: SheetModel = helper.invoke('getActiveSheet');
                helper.invoke('selectRange', ['A9:A11']);
                helper.openAndClickCMenuItem(8, 0, [6, 2], true);
                expect(JSON.stringify(getCell(12, 3, sheet).validation)).toBe(validation);
                expect(JSON.stringify(getCell(13, 3, sheet).validation)).toBe(validation);
                expect(JSON.stringify(getCell(14, 3, sheet).validation)).toBe(validation);
                expect(JSON.stringify(getCell(15, 3, sheet).validation)).toBe(validation);
                done();
            });

            it('Insert below with mutliple row - Undo & Redo', (done: Function) => {
                const validation: string = '{"type":"List","value1":"1,2"}';
                const sheet: SheetModel = helper.invoke('getActiveSheet');
                helper.click('#spreadsheet_undo');
                expect(JSON.stringify(getCell(12, 3, sheet).validation)).toBe(validation);
                expect(getCell(13, 3, sheet).validation).toBeUndefined();
                expect(getCell(14, 3, sheet).validation).toBeUndefined();
                expect(getCell(15, 3, sheet).validation).toBeUndefined();
                helper.click('#spreadsheet_redo');
                expect(JSON.stringify(getCell(12, 3, sheet).validation)).toBe(validation);
                expect(JSON.stringify(getCell(13, 3, sheet).validation)).toBe(validation);
                expect(JSON.stringify(getCell(14, 3, sheet).validation)).toBe(validation);
                expect(JSON.stringify(getCell(15, 3, sheet).validation)).toBe(validation);
                done();
            });

            it('Insert above with mutliple row - not to update case', (done: Function) => {
                const sheet: SheetModel = helper.invoke('getActiveSheet');
                helper.invoke('selectRange', ['A9:A10']);
                helper.openAndClickCMenuItem(8, 0, [6, 1], true);
                expect(getCell(8, 3, sheet)).toBeNull();
                expect(getCell(9, 3, sheet)).toBeNull();
                done();
            });

            it('Insert below with mutliple row - not to update case', (done: Function) => {
                const sheet: SheetModel = helper.invoke('getActiveSheet');
                helper.invoke('selectRange', ['A18:A19']);
                helper.openAndClickCMenuItem(17, 0, [6, 2], true);
                expect(getCell(19, 3, sheet)).toBeNull();
                expect(getCell(20, 3, sheet)).toBeNull();
                done();
            });

            it('Clear all on column validation is not working', (done: Function) => {
                helper.getInstance().workbookDataValidationModule.validationHandler({
                    range: 'Sheet1!G:G', rules: {
                        type: 'List', operator: 'Between', value1: '1', value2: '', ignoreBlank: true, inCellDropDown: true
                    }
                });
                helper.invoke('selectRange', ['G3:G5']);
                helper.click(`#${helper.id}_clear`);
                helper.click('.e-clear-ddb ul li');
                const validation: ValidationModel = helper.getInstance().sheets[0].columns[6].validation;
                expect(validation.address).toBe('G1:G2 G6:G1048576');
                helper.edit('G3', '4');
                setTimeout(() => {
                    expect(helper.getElementFromSpreadsheet('.e-validationerror-dlg.e-dialog')).toBeNull();
                    helper.edit('G2', '4');
                    setTimeout(() => {
                        expect(helper.getElementFromSpreadsheet('.e-validationerror-dlg.e-dialog')).not.toBeNull();
                        helper.setAnimationToNone('.e-validationerror-dlg.e-dialog');
                        helper.click('.e-validationerror-dlg .e-footer-content button:nth-child(2)');
                        // Clearing another range
                        helper.invoke('selectRange', ['G10:G14']);
                        helper.click(`#${helper.id}_clear`);
                        helper.click('.e-clear-ddb ul li');
                        expect(validation.address).toBe('G1:G2 G6:G9 G15:G1048576');
                        // Clearing between the range
                        helper.invoke('selectRange', ['G12:G16']);
                        helper.click(`#${helper.id}_clear`);
                        helper.click('.e-clear-ddb ul li');
                        expect(validation.address).toBe('G1:G2 G6:G9 G17:G1048576');
                        // Clearing between the range
                        helper.invoke('selectRange', ['G2:G3']);
                        helper.click(`#${helper.id}_clear`);
                        helper.click('.e-clear-ddb ul li');
                        expect(validation.address).toBe('G1:G1 G6:G9 G17:G1048576');
                        done();
                    });
                });
            });
        });

        describe('SF-362574->', () => {
            beforeEach((done: Function) => {
                helper.initializeSpreadsheet({
                    sheets: [{ ranges: [{ dataSource: defaultData }] }]
                }, done);
            });
            afterEach(() => {
                helper.invoke('destroy');
            });
            it('IsHighlighted property is enabled if data is filtered', (done: Function) => {
                const spreadsheet: Spreadsheet = helper.getInstance();
                spreadsheet.addDataValidation({ type: 'WholeNumber', operator: 'LessThanOrEqualTo', value1: '99999' }, 'E1:E11');
                expect(spreadsheet.sheets[0].rows[0].cells[4].validation.isHighlighted).toBeUndefined();
                expect(spreadsheet.sheets[0].rows[8].cells[4].validation.isHighlighted).toBeUndefined();
                spreadsheet.applyFilter(
                    [{ value: 310, field: 'F', predicate: 'or', operator: 'equal', type: 'number', matchCase: false, ignoreAccent: false }],
                    'A1:H11').then((): void => {
                    expect(spreadsheet.sheets[0].rows[0].cells[4].validation.isHighlighted).toBeUndefined();
                    expect(spreadsheet.sheets[0].rows[8].cells[4].validation.isHighlighted).toBeUndefined();
                    setTimeout((): void => {
                        done();
                    });
                });
            });
        });
    });

        
    describe('Localization is not updated for apply  button in the data Validation Pop-up ->',()=>{
        describe('EJ2-55546->', () => {
            beforeEach((done: Function)=> {
                L10n.load({
                    'de-DE': {
                        'spreadsheet': {
                            'Cut': 'Schneiden',
                            'Copy': 'Kopieren',
                            'Paste': 'Paste',
                            'PasteSpecial': 'paste spezial',
                            'All': 'Alles',
                            'Values': 'Werte',
                            'Formats': 'Formate',
                            'Font': 'Schriftart',
                            'FontSize': 'Schriftgröße',
                            'Bold': 'Fett gedruckt',
                            'Italic': 'Kursiv',
                            'Underline': 'Unterstreichen',
                            'Strikethrough': 'Durchgestrichen',
                            'TextColor': 'Textfarbe',
                            'FillColor': 'Füllfarbe',
                            'HorizontalAlignment': 'Horizontale Ausrichtung',
                            'AlignLeft': 'Linksbündig ausrichten',
                            'AlignCenter': 'Center',
                            'AlignRight': 'Rechtsbündig ausrichten',
                            'VerticalAlignment': 'Vertikale Ausrichtung',
                            'AlignTop': 'Oben ausrichten',
                            'AlignMiddle': 'Mitte ausrichten',
                            'AlignBottom': 'Unten ausrichten',
                            'InsertFunction': 'Funktion einfügen',
                            'Insert': 'Einfügen',
                            'Delete': 'Löschen',
                            'Rename': 'Umbenennen',
                            'Hide': 'verbergen',
                            'Unhide': 'Sichtbar machen',
                            'NameBox': 'Namensfeld',
                            'ShowHeaders': 'Kopfzeilen anzeigen',
                            'HideHeaders': 'Header ausblenden',
                            'ShowGridLines': 'Gitternetzlinien anzeigen',
                            'HideGridLines': 'Gitternetzlinien ausblenden',
                            'AddSheet': 'Blatt hinzufügen',
                            'ListAllSheets': 'Alle Blätter auflisten',
                            'FullScreen': 'Vollbild',
                            'CollapseToolbar': 'Zusammenbruch symbolleiste',
                            'ExpandToolbar': 'Erweitern Symbolleiste',
                            'CollapseFormulaBar': 'Collapse Formelleiste',
                            'ExpandFormulaBar': 'Expand Formelleiste',
                            'File': 'Datei',
                            'Home': 'Huis',
                            'Formulas': 'Formeln',
                            'View': 'Aussicht',
                            'New': 'Neu',
                            'Open': 'Öffnen',
                            'SaveAs': 'Speichern als',
                            'ExcelXlsx': 'Microsoft Excel',
                            'ExcelXls': 'Microsoft Excel 97-2003',
                            'CSV': 'Comma-separated values',
                            'FormulaBar': 'Formelleiste',
                            'Ok': 'OK',
                            'Close': 'Schließen',
                            'Cancel': 'Abbrechen',
                            'Apply': 'Anwenden',
                            'MoreColors': 'Mehr Farben',
                            'StandardColors': 'Standard farben',
                            'General': 'Allgemeines',
                            'Number': 'Nummer',
                            'Currency': 'Währung',
                            'Accounting': 'Buchhaltung',
                            'ShortDate': 'Kurzes Date',
                            'LongDate': 'Langes Datum',
                            'Time': 'Zeit',
                            'Percentage': 'Prozentsatz',
                            'Fraction': 'Fraktion',
                            'Scientific': 'Wissenschaft',
                            'Text': 'Text',
                            'NumberFormat': 'Zahlenformat',
                            'MobileFormulaBarPlaceHolder': 'Wert oder Formel eingeben',
                            'PasteAlert': 'Sie können dies hier nicht einfügen, da der Kopierbereich und der Einfügebereich nicht dieselbe Größe haben. Bitte versuchen Sie es in einem anderen Bereich.',
                            'DestroyAlert': 'Möchten Sie die aktuelle Arbeitsmappe wirklich löschen, ohne sie zu speichern, und eine neue Arbeitsmappe erstellen?',
                            'SheetRenameInvalidAlert': 'Der Blattname enthält ein ungültiges Zeichen.',
                            'SheetRenameEmptyAlert': 'Der Blattname darf nicht leer sein.',
                            'SheetRenameAlreadyExistsAlert': 'Der Blattname ist bereits vorhanden. Bitte geben Sie einen anderen Namen ein.',
                            'DeleteSheetAlert': 'Möchten Sie dieses Blatt wirklich löschen?',
                            'DeleteSingleLastSheetAlert': 'Eine Arbeitsmappe muss mindestens ein sichtbares Arbeitsblatt enthalten.',
                            'PickACategory': 'Wählen Sie eine Kategorie',
                            'Description': 'Beschreibung',
                            'UnsupportedFile': 'Nicht unterstützte Datei',
                            'InvalidUrl': 'Ungültige URL',
                            'SUM': 'Fügt eine Reihe von Zahlen und / oder Zellen hinzu.',
                            'SUMIF': 'Fügt die Zellen basierend auf der angegebenen Bedingung hinzu.',
                            'SUMIFS': 'Fügt die Zellen basierend auf den angegebenen Bedingungen hinzu.',
                            'ABS': 'Gibt den Wert einer Zahl ohne Vorzeichen zurück.',
                            'RAND': 'Gibt eine Zufallszahl zwischen 0 und 1 zurück.',
                            'RANDBETWEEN': 'Gibt eine zufällige Ganzzahl basierend auf angegebenen Werten zurück.',
                            'FLOOR': 'Rundet eine Zahl auf das nächste Vielfache eines bestimmten Faktors ab.',
                            'CEILING': 'Rundet eine Zahl auf das nächste Vielfache eines bestimmten Faktors.',
                            'PRODUCT': 'Multipliziert eine Reihe von Zahlen und / oder Zellen.',
                            'AVERAGE': 'Berechnen Sie den Durchschnitt für die Reihe von Zahlen und / oder Zellen ohne Text.',
                            'AVERAGEIF': 'Berechnet den Durchschnitt für die Zellen basierend auf der angegebenen Bedingung.',
                            'AVERAGEIFS': 'Berechnet den Durchschnitt für die Zellen basierend auf den angegebenen Bedingungen.',
                            'AVERAGEA': 'Berechnet den Durchschnitt für die Zellen, wobei WAHR als 1, text und FALSCH als 0 ausgewertet werden.',
                            'COUNT': 'Zählt die Zellen, die numerische Werte in einem Bereich enthalten.',
                            'COUNTIF': 'Zählt die Zellen basierend auf der angegebenen Bedingung.',
                            'COUNTIFS': 'Zählt die Zellen basierend auf den angegebenen Bedingungen.',
                            'COUNTA': 'Zählt die Zellen, die Werte in einem Bereich enthalten.',
                            'MIN': 'Gibt die kleinste Anzahl der angegebenen Argumente zurück.',
                            'MAX': 'Gibt die größte Anzahl der angegebenen Argumente zurück.',
                            'DATE': 'Gibt das Datum basierend auf einem bestimmten Jahr, Monat und Tag zurück.',
                            'DAY': 'Gibt den Tag ab dem angegebenen Datum zurück.',
                            'DAYS': 'Gibt die Anzahl der Tage zwischen zwei Daten zurück.',
                            'IF': 'Gibt einen Wert basierend auf dem angegebenen Ausdruck zurück.',
                            'IFS': 'Gibt einen Wert zurück, der auf den angegebenen mehreren Ausdrücken basiert.',
                            'AND': 'Gibt WAHR zurück, wenn alle Argumente WAHR sind, andernfalls wird FALSCH zurückgegeben.',
                            'OR': 'Gibt WAHR zurück, wenn eines der Argumente WAHR ist, andernfalls wird FALSCH zurückgegeben.',
                            'IFERROR': 'Gibt einen Wert zurück, wenn kein Fehler gefunden wurde. Andernfalls wird der angegebene Wert zurückgegeben.',
                            'CHOOSE': 'Gibt einen Wert aus der Werteliste basierend auf der Indexnummer zurück.',
                            'INDEX': 'Gibt einen Wert der Zelle in einem bestimmten Bereich basierend auf der Zeilen- und Spaltennummer zurück.',
                            'FIND': 'Gibt die Position eines Strings innerhalb eines anderen Strings zurück, wobei die Groß- und Kleinschreibung beachtet wird.',
                            'CONCATENATE': 'Kombiniert zwei oder mehr Zeichenfolgen.',
                            'CONCAT': 'Verkettet eine Liste oder einen Bereich von Textzeichenfolgen.',
                            'SUBTOTAL': 'Gibt die Zwischensumme für einen Bereich unter Verwendung der angegebenen Funktionsnummer zurück.',
                            'RADIANS': 'Konvertiert Grad in Bogenmaß.',
                            'MATCH': 'Gibt die relative Position eines angegebenen Wertes im angegebenen Bereich zurück.',
                            'DefineNameExists': 'Dieser Name ist bereits vorhanden, versuchen Sie es mit einem anderen Namen.',
                            'CircularReference': 'Wenn eine Formel auf einen oder mehrere Zirkelverweise verweist, kann dies zu einer falschen Berechnung führen.',
                            'CustomFormat': 'Geben Sie das Format ein',
                            'APPLY':'vorgehen',                           
                        }
                    }
                });
                helper.initializeSpreadsheet({locale:'de-DE'},done);
            });
            afterEach(()=>{
                helper.invoke('destroy');
            });
            it('apply button is not updated while applying localization',(done:Function)=>{
                helper.switchRibbonTab(4);
                helper.getElement('#'+helper.id+'_datavalidation').click();
                helper.getElement('#'+helper.id+'_datavalidation-popup li:nth-child(1)').click();
                var footer:HTMLElement = helper.getElement('.e-footer-content button:nth-child(2)');
                expect(footer.textContent).toBe('vorgehen');
                done();
            });
        });
    });
    describe('CR - Issues->', () => {
        describe('EJ2-50373->', () => {
            beforeEach((done: Function) => {
                helper.initializeSpreadsheet({
                    sheets: [{ ranges: [{ dataSource: defaultData }], selectedRange: 'B2:B10' }]
                }, done);
            });
            afterEach(() => {
                helper.invoke('destroy');
            });
            it('Data Validation not properly working when input value is given with Date Format', (done: Function) => {
                helper.invoke('selectRange', ['B2:B10']);
                helper.switchRibbonTab(4);
                helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
                setTimeout(() => {
                    helper.click('.e-datavalidation-ddb li:nth-child(1)');
                    setTimeout(() => {
                        let ddlElem: any = helper.getElements('.e-datavalidation-dlg .e-allow .e-dropdownlist')[0];
                        ddlElem.ej2_instances[0].value = 'Date';
                        ddlElem.ej2_instances[0].dataBind();
                        let ddlElement: any = helper.getElements('.e-datavalidation-dlg .e-data .e-dropdownlist')[0];
                        ddlElement.ej2_instances[0].value = 'Equal to';
                        ddlElement.ej2_instances[0].dataBind();
                        helper.getElements('.e-datavalidation-dlg .e-values .e-input')[0].value = '6/23/2014';
                        helper.setAnimationToNone('.e-datavalidation-dlg.e-dialog');
                        helper.getElements('.e-datavalidation-dlg .e-footer-content')[0].children[1].click();
                        setTimeout(() => {
                            helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
                            helper.click('.e-datavalidation-ddb li:nth-child(2)');
                            setTimeout(() => {
                                expect(helper.invoke('getCell', [4, 1]).style.backgroundColor).toBe('rgb(255, 255, 0)');
                                expect(helper.invoke('getCell', [4, 1]).style.color).toBe('rgb(255, 0, 0)');
                                expect(helper.invoke('getCell', [5, 1]).style.backgroundColor).toBeNull;
                                expect(helper.invoke('getCell', [5, 1]).style.color).toBeNull;
                                done();
                            });
                        });
                    });
                });
            });
            it('Data Validation not properly working when input value is given with Time Format', (done: Function) => {
                helper.invoke('selectRange', ['C2:C10']);
                helper.switchRibbonTab(4);
                helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
                setTimeout(() => {
                    helper.click('.e-datavalidation-ddb li:nth-child(1)');
                    setTimeout(() => {
                        let ddlElem: any = helper.getElements('.e-datavalidation-dlg .e-allow .e-dropdownlist')[0];
                        ddlElem.ej2_instances[0].value = 'Time';
                        ddlElem.ej2_instances[0].dataBind();
                        let ddlElement: any = helper.getElements('.e-datavalidation-dlg .e-data .e-dropdownlist')[0];
                        ddlElement.ej2_instances[0].value = 'Equal to';
                        ddlElement.ej2_instances[0].dataBind();
                        helper.getElements('.e-datavalidation-dlg .e-values .e-input')[0].value = '12:43:59 AM';
                        helper.setAnimationToNone('.e-datavalidation-dlg.e-dialog');
                        helper.getElements('.e-datavalidation-dlg .e-footer-content')[0].children[1].click();
                        setTimeout(() => {
                            helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
                            helper.click('.e-datavalidation-ddb li:nth-child(2)');
                            setTimeout(() => {
                                expect(helper.invoke('getCell', [4, 2]).style.backgroundColor).toBe('rgb(255, 255, 0)');
                                expect(helper.invoke('getCell', [4, 2]).style.color).toBe('rgb(255, 0, 0)');
                                expect(helper.invoke('getCell', [5, 2]).style.backgroundColor).toBeNull;
                                expect(helper.invoke('getCell', [5, 2]).style.color).toBeNull;
                                done();
                            });
                        });
                    });
                });
            });
        });
        describe('EJ2-50399, EJ2-60806 ->', () => {
            beforeAll((done: Function) => {
                helper.initializeSpreadsheet({
                    sheets: [{ ranges: [{ dataSource: defaultData }], selectedRange: 'A2:E4' }]
                }, done);
            });
            afterAll(() => {
                helper.invoke('destroy');
            });
            it('Add Data Validation', (done: Function) => {
                helper.switchRibbonTab(4);
                helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
                setTimeout(() => {
                    helper.click('.e-datavalidation-ddb li:nth-child(1)');
                    setTimeout(() => {
                        let ddlElem: any = helper.getElements('.e-datavalidation-dlg .e-allow .e-dropdownlist')[0];
                        ddlElem.ej2_instances[0].value = 'Text Length';
                        ddlElem.ej2_instances[0].dataBind();
                        let ddlElement: any = helper.getElements('.e-datavalidation-dlg .e-data .e-dropdownlist')[0];
                        ddlElement.ej2_instances[0].value = 'Greater than';
                        ddlElement.ej2_instances[0].dataBind();
                        helper.getElements('.e-datavalidation-dlg .e-values .e-input')[0].value = '6';
                        helper.setAnimationToNone('.e-datavalidation-dlg.e-dialog');
                        helper.getElements('.e-datavalidation-dlg .e-footer-content')[0].children[1].click();
                        setTimeout(() => {
                            helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
                            helper.click('.e-datavalidation-ddb li:nth-child(2)');
                            helper.invoke('selectRange', ['E2']);
                            done();
                        });
                    });
                });
            });
            it('In Data validation, highlight cell color is removed if we double click on the cell', (done: Function) => {
                let td: HTMLElement = helper.invoke('getCell', [1, 4]);
                let coords: ClientRect = td.getBoundingClientRect();
                helper.triggerMouseAction('dblclick', { x: coords.left, y: coords.top }, null, td);
                helper.triggerKeyNativeEvent(13);
                setTimeout(() => {
                    let dialog: HTMLElement = helper.getElement('.e-validationerror-dlg.e-dialog');
                    expect(!!dialog).toBeTruthy();
                    expect(dialog.querySelector('.e-dlg-content').textContent).toBe(
                    "This value doesn't match the data validation restrictions defined for the cell.");
                    helper.setAnimationToNone('.e-validationerror-dlg.e-dialog');
                    helper.click('.e-validationerror-dlg .e-footer-content button:nth-child(1)');
                    setTimeout(() => {
                        expect(helper.invoke('getCell', [1, 4]).style.backgroundColor).toBe('rgb(255, 255, 0)');
                        expect(helper.invoke('getCell', [1, 4]).style.color).toBe('rgb(255, 0, 0)');
                        done();
                    });
                });
            });
            it('Clear Highlight is not working after Hyperlink to Data Validation applied cells', (done: Function) => {
                helper.getInstance().addDataValidation({ type: "Decimal", operator: "Between", value1: "0", value2: "40" }, 'H2:H11');
                helper.invoke('addInvalidHighlight', ['H2:H11']);
                helper.invoke('selectRange', ['H3']);
                helper.getInstance().addHyperlink('www.syncfusion.com', 'H3', 50);
                let td: HTMLElement = helper.invoke('getCell', [2, 7]);
                helper.invoke('removeInvalidHighlight', ['H2:H11']);
                expect(td.style.backgroundColor).toBe('rgb(255, 255, 255)');
                done();                
            });
        });            
        describe('EJ2-50626', () => {
            beforeAll((done: Function) => {
                helper.initializeSpreadsheet({
                    sheets: [{ }]
                }, done);
            });
            afterAll(() => {
                helper.invoke('destroy');
            });
            it('Add Data Validation', (done: Function) => {
                helper.invoke('selectRange', ['C3']);
                helper.switchRibbonTab(4);
                helper.getElementFromSpreadsheet('#' + helper.id + '_datavalidation').click();
                setTimeout(() => {
                    helper.click('.e-datavalidation-ddb li:nth-child(1)');
                    setTimeout(() => {
                        let ddlElem: any = helper.getElements('.e-datavalidation-dlg .e-allow .e-dropdownlist')[0];
                        ddlElem.ej2_instances[0].value = 'List';
                        ddlElem.ej2_instances[0].dataBind();
                        helper.getElements('.e-datavalidation-dlg .e-values .e-input')[0].value = 'A,B,C';
                        helper.setAnimationToNone('.e-datavalidation-dlg.e-dialog');
                        helper.click('.e-datavalidation-dlg .e-footer-content button:nth-child(2)');
                        done();
                    });
                });
            });
            it('When DataValidation using list is applied, it shows duplicate values in formula bar', (done: Function) => {
                const ddlObj: any = getComponent(helper.invoke('getCell', [2, 2]).querySelector('.e-dropdownlist'), 'dropdownlist');
                ddlObj.showPopup();
                setTimeout(() => {
                    helper.click('.e-ddl.e-popup li:nth-child(1)');
                    setTimeout(() => {
                        expect(helper.getElement('#' + helper.id + '_formula_input').value).toEqual('A');
                        done();
                    });
                });
            });                 
        });
        describe('EJ2-51866->', () => {
            beforeEach((done: Function) => {
                helper.initializeSpreadsheet({
                    sheets: [{ rows: [{  }] }, { rows: [{ cells: [{ value: '1' }] },
                    { cells: [{ value: '2' }] }, { cells: [{ value: '' }] }, { cells: [{ value: '3' }] },
                    { cells: [{ value: '4' }] },  { cells: [{ value: '5' }] }] }], activeSheetIndex: 0
                }, done);
            });
            afterEach(() => {
                helper.invoke('destroy');
            });
            it('List type data validation issue while refer another sheet ranges as value->', (done: Function) => {
                helper.invoke('addDataValidation', [{ type: "List", operator: "Between", value1: "=Sheet2!$A1:$A6" }, 'C2']);
                helper.invoke('selectRange', ['C2']);
                const ddlObj: any = getComponent(helper.invoke('getCell', [1, 2]).querySelector('.e-dropdownlist'), 'dropdownlist');
                ddlObj.showPopup();
                setTimeout(() => {
                    let popUpElem: HTMLElement = helper.getElement('.e-popup-open .e-dropdownbase');
                    expect(popUpElem.firstElementChild.childElementCount).toBe(6);
                    expect(popUpElem.firstElementChild.textContent).toBe('12345');
                    helper.click('.e-ddl.e-popup li:nth-child(4)');
                    done();
                });
            });
        });
    });
});