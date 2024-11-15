// ==UserScript==
// @name         GGH
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  Intégration d'un visuel BBHien à l'infâme GH.
// @author       Eliam
// @match        https://gest-hordes2.eragaming.fr/carte/*
// @updateURL    https://github.com/Croaaa/GGH/raw/main/GGH.user.js
// @downloadURL  https://github.com/Croaaa/GGH/raw/main/GGH.user.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    let backgroundAdded = false;

    function getMapId() {
        const urlParts = window.location.pathname.split('/');
        return urlParts[urlParts.length - 1];
    }

    function applyStyles(element, styles) {
        Object.assign(element.style, styles);
    }

    function addBackground() {
        const carteElement = document.querySelector('.background_carte_color');
        if (carteElement && !backgroundAdded) {
            carteElement.style.backgroundImage = "url('https://bbh.fred26.fr/gfx/design/desert.jpg')";
            carteElement.style.backgroundSize = 'cover';
            console.log('[ADDED] Background');
            backgroundAdded = true;
            applyModifications();
        } else if (backgroundAdded) {
            console.log('[SKIPPED] Background already added');
        }
    }

    function removeUseHref() {
        const svgElements = document.querySelectorAll('svg.camp.planJaune.gdCarte, svg.camp.planBleu.gdCarte');
        svgElements.forEach(svg => {
            const useElement = svg.querySelector('use');
            if (useElement) {
                useElement.removeAttribute('xlink:href');
            }
        });
        console.log('[EXECUTED] removeUseHref');
    }

    function manageCitizenCases() {
        console.log('[EXECUTED] manageCitizenCases');
        const paramCitizens = document.querySelector('#param_citoyensVille');
        const casesWithCitizens = document.querySelectorAll('.citoyensVilleDiv');

        const isChecked = paramCitizens && paramCitizens.checked;

        if (isChecked) {
            casesWithCitizens.forEach(caseCitizen => {
                const caseParent = caseCitizen.closest('.caseCarte');
                const spanElement = caseCitizen.querySelector('.citoyensVilleSpan');

                if (caseParent && spanElement) {
                    caseParent.style.backgroundColor = '#7DA450';
                    const dangerElement = caseParent.querySelector('.danger');

                    if (dangerElement && dangerElement.classList.contains('gdCarte')) {
                        dangerElement.classList.remove('gdCarte');
                    }
                }
            });
        }

        applyCitizenColors();
    }

    function manageZombieCases() {
        console.log('[EXECUTED] manageZombieCases');
        const paramZombies = document.querySelector('#param_zombie');
        const dataZombies = JSON.parse(localStorage.getItem('data-zombie')) || {};
        const mapId = getMapId();

        if (!dataZombies[mapId]) {
            return;
        }

        const isChecked = paramZombies && paramZombies.checked;

        const existingZombieElements = document.querySelectorAll('.zombieSpan, .zombieVille');
        existingZombieElements.forEach(el => el.remove());

        Object.entries(dataZombies[mapId]).forEach(([coord, numZombies]) => {
            const [x, y] = coord.split('_');
            const caseCarte = document.querySelector(`td[id="${x}_${y}"]`);
            if (caseCarte && isChecked) {
                let citoyensVilleDiv = caseCarte.querySelector('.citoyensVilleDiv');

                if (!citoyensVilleDiv) {
                    citoyensVilleDiv = document.createElement('div');
                    citoyensVilleDiv.className = 'citoyensVilleDiv gdCarte';
                    caseCarte.appendChild(citoyensVilleDiv);
                }

                let zombiesContainer = citoyensVilleDiv.querySelector('.zombiesContainer');

                if (!zombiesContainer) {
                    zombiesContainer = document.createElement('div');
                    zombiesContainer.className = 'zombiesContainer';
                    applyStyles(zombiesContainer, {
                        position: 'absolute',
                        left: '0',
                        bottom: '0',
                        display: 'flex',
                        alignItems: 'flex-end'
                    });
                    citoyensVilleDiv.appendChild(zombiesContainer);
                }

                const zombieSpan = document.createElement('span');
                zombieSpan.textContent = numZombies >= 10 ? '+' : numZombies;
                zombieSpan.className = 'zombieSpan';

                const zombieImg = document.createElement('img');
                zombieImg.src = 'https://myhordes.fr/build/images/pictos/r_killz.78934ff3.gif';
                zombieImg.className = 'zombieVille';

                applyStyles(zombieSpan, {
                    fontSize: '0.5em',
                    backgroundColor: '#8B0000',
                    color: 'white',
                    padding: '0px 1px',
                    borderRadius: '1px',
                    marginLeft: '2px',
                    marginRight: '-1px',
                    marginBottom: '2px'
                });

                applyStyles(zombieImg, {
                    width: '15px',
                    height: '15px',
                    marginBottom: '2px'
                });

                zombiesContainer.appendChild(zombieSpan);
                zombiesContainer.appendChild(zombieImg);
            }
        });
    }

    function removeDangerClass() {
        console.log('[EXECUTED] removeDangerClass');

        const dataCitizens = JSON.parse(localStorage.getItem('data-citizens')) || {};
        const mapId = getMapId();

        if (!dataCitizens[mapId]) {
            return;
        }

        Object.keys(dataCitizens[mapId]).forEach(coord => {
            const [x, y] = coord.split('_');
            const caseCarte = document.querySelector(`td[id="${x}_${y}"]`);
            if (caseCarte) {
                const dangerElement = caseCarte.querySelector('.danger.gdCarte');
                if (dangerElement) {
                    dangerElement.classList.remove('gdCarte');
                }
            }
        });
    }

    function invertCitizenDivs() {
        console.log('[EXECUTED] invertCitizenDivs');
        const citoyensVilleDivs = document.querySelectorAll('.citoyensVilleDiv');
        citoyensVilleDivs.forEach(citoyensVilleDiv => {
            const spanElement = citoyensVilleDiv.querySelector('.citoyensVilleSpan');
            const svgElement = citoyensVilleDiv.querySelector('.citoyensVille');
            if (spanElement && svgElement) {
                citoyensVilleDiv.insertBefore(svgElement, spanElement);

                const numCitoyens = parseInt(spanElement.textContent, 10);
                if (!isNaN(numCitoyens) && numCitoyens >= 10) {
                    spanElement.textContent = '+';
                }

                applyStyles(spanElement, {
                    fontSize: '0.5em',
                    backgroundColor: '#1F8F1F',
                    color: 'white',
                    padding: '0px 1px',
                    borderRadius: '1px',
                    marginLeft: '0px',
                    marginRight: '2px',
                    marginBottom: '2px'
                });

                applyStyles(svgElement, {
                    width: '15px',
                    height: '15px'
                });
            }
        });
    }

    function saveCitizenData() {
        console.log('[EXECUTED] saveCitizenData');

        const paramCitizens = document.querySelector('#param_citoyensVille');
        const dataCitizens = JSON.parse(localStorage.getItem('data-citizens')) || {};
        const mapId = getMapId();
        dataCitizens[mapId] = {};

        const casesCarte = document.querySelectorAll('.caseCarte');
        casesCarte.forEach(caseCarte => {
            const [x, y] = caseCarte.getAttribute('id')?.split('_');
            const citizenDiv = caseCarte.querySelector('.citoyensVilleDiv .citoyensVilleSpan');

            if (citizenDiv) {
                const numCitizens = parseInt(citizenDiv.textContent);

                if (numCitizens > 0) {
                    dataCitizens[mapId][`${x}_${y}`] = numCitizens;
                }
            }
        });

        if (paramCitizens && paramCitizens.checked || Object.keys(dataCitizens[mapId]).length > 0) {
            localStorage.setItem('data-citizens', JSON.stringify(dataCitizens));
            console.log('[SAVED] Citizen data:', dataCitizens);
        } else {
            console.log('[SKIPPED] No citizens to save');
        }
    }

    function saveZombieData() {
        console.log('[EXECUTED] saveZombieData');

        const paramZombies = document.querySelector('#param_zombie');
        const mapId = getMapId();
        const dataZombies = JSON.parse(localStorage.getItem('data-zombie')) || {};
        dataZombies[mapId] = {};

        const casesCarte = document.querySelectorAll('.caseCarte');
        casesCarte.forEach(caseCarte => {
            const [x, y] = caseCarte.getAttribute('id')?.split('_');
            const zombieSvg = caseCarte.querySelector('.zombReel.zombie.gdCarte use');

            if (zombieSvg) {
                const hrefValue = zombieSvg.getAttribute('xlink:href');
                const match = hrefValue ? hrefValue.match(/#(\d+)z/) : null;

                if (match && match[1]) {
                    const numZombies = parseInt(match[1]);
                    if (numZombies > 0) {
                        dataZombies[mapId][`${x}_${y}`] = numZombies;
                    }
                }
            }
        });

        if (paramZombies && paramZombies.checked || Object.keys(dataZombies[mapId]).length > 0) {
            localStorage.setItem('data-zombie', JSON.stringify(dataZombies));
            console.log('[SAVED] Zombie data:', dataZombies);
        } else {
            console.log('[SKIPPED] No zombie data to save');
        }
    }

    function applyCitizenColors() {
        console.log('[EXECUTED] applyCitizenColors');

        const dataCitizens = JSON.parse(localStorage.getItem('data-citizens')) || {};
        const mapId = getMapId();

        if (!dataCitizens[mapId]) {
            return;
        }

        Object.entries(dataCitizens[mapId]).forEach(([coord, numCitizens]) => {
            if (numCitizens > 0) {
                const [x, y] = coord.split('_');
                const caseCarte = document.querySelector(`td[id="${x}_${y}"]`);

                if (caseCarte) {
                    caseCarte.style.backgroundColor = '#7DA450';
                }
            }
        });
    }

    function displayParamTab() {
        const options = document.querySelectorAll('#optionDiverseCarte div');
        const container = document.querySelector('#optionDiverseCarte');

        const buttonOrder = [
            "param_danger",
            "param_ctrl",
            "param_distance",
            "param_distance_pa",
            "param_scrut",
            "param_carteAlter",
            "param_carteScrut",
            "param_citoyensVille",
            "param_zombie",
            "param_estimZombie",
            "param_objetSol",
            "param_objetMarq",
            "param_epuise",
            "param_indicVisit",
            "param_zonage",
            "param_balisage"
        ];

        const buttonLabels = {
            param_danger: "Dangers",
            param_ctrl: "Contrôle",
            param_distance: "Limi. KM",
            param_distance_pa: "Limi. PA",
            param_scrut: "Scrut",
            param_carteAlter: "Carte Alter",
            param_carteScrut: "Carte Scrut",
            param_citoyensVille: "Citoyens",
            param_zombie: "Zombies",
            param_estimZombie: "Estim. Zombie",
            param_objetSol: "Objet Sol",
            param_objetMarq: "Objet Marq.",
            param_epuise: "Praf",
            param_indicVisit: "Indic. Visite",
            param_zonage: "Zonage",
            param_balisage: "Balisage"
        };

        buttonOrder.forEach(id => {
            const option = Array.from(options).find(opt => opt.querySelector(`input[type="checkbox"]#${id}`));
            if (option) {
                const checkbox = option.querySelector('input[type="checkbox"]');
                const label = option.querySelector('label');

                if (checkbox && label && buttonLabels[id]) {
                    label.textContent = buttonLabels[id];

                    if (id === 'param_carteAlter') {
                        const infoBulle = label.querySelector('.infoBulle');
                        if (infoBulle) {
                            infoBulle.remove();
                        }
                    }
                }

                container.appendChild(option);

                applyStyles(option, {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    backgroundImage: "url('https://gitlab.com/eternaltwin/myhordes/myhordes/-/raw/master/assets/img/background/bg_button.gif')",
                    backgroundSize: 'cover',
                    margin: '2px',
                    padding: '5px 10px',
                    border: '1px solid #444',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    color: 'white',
                    transition: 'border-color 0.1s ease'
                });

                option.addEventListener('mouseenter', () => {
                    applyStyles(option, {
                        borderColor: '#f5f5dc'
                    });
                });

                option.addEventListener('mouseleave', () => {
                    applyStyles(option, {
                        borderColor: '#444'
                    });
                });

                if (checkbox) {
                    checkbox.style.display = 'none';

                    let icon = option.querySelector('.option-icon');
                    if (!icon) {
                        icon = document.createElement('span');
                        icon.className = 'option-icon';
                        applyStyles(icon, {
                            width: '16px',
                            height: '16px',
                            display: 'inline-block',
                            backgroundSize: 'cover',
                            marginRight: '5px'
                        });
                        option.prepend(icon);
                    }

                    if (checkbox.checked) {
                        option.classList.add('checked');
                        option.classList.remove('unchecked');
                        applyStyles(icon, {
                            backgroundImage: "url('https://gitlab.com/eternaltwin/myhordes/myhordes/-/raw/master/assets/img/icons/player_online.gif')"
                        });
                    } else {
                        option.classList.add('unchecked');
                        option.classList.remove('checked');
                        applyStyles(icon, {
                            backgroundImage: "url('https://gitlab.com/eternaltwin/myhordes/myhordes/-/raw/master/assets/img/icons/player_offline.gif')"
                        });
                    }

                    checkbox.addEventListener('change', () => {
                        if (checkbox.checked) {
                            option.classList.add('checked');
                            option.classList.remove('unchecked');
                            applyStyles(icon, {
                                backgroundImage: "url('https://gitlab.com/eternaltwin/myhordes/myhordes/-/raw/master/assets/img/icons/player_online.gif')"
                            });
                        } else {
                            option.classList.add('unchecked');
                            option.classList.remove('checked');
                            applyStyles(icon, {
                                backgroundImage: "url('https://gitlab.com/eternaltwin/myhordes/myhordes/-/raw/master/assets/img/icons/player_offline.gif')"
                            });
                        }
                    });
                }
            }
        });
    }

    function handleParameterChange(event) {
        const paramId = event.target.id;
        console.log(`[EVENT] ${paramId} parameter toggled`);

        switch (paramId) {
            case 'param_danger':
                removeDangerClass();
            case 'param_citoyensVille':
                manageCitizenCases();
                invertCitizenDivs();
                applyCitizenColors();
                break;
            case 'param_zombie':
                manageZombieCases();
                break;
            default:
                break;
        }
    }

    function observeParameters() {
        console.log('[EXECUTED] observeParameters');
        const paramsContainer = document.querySelector('#optionDiverseCarte');

        if (!paramsContainer) {
            console.log('[ERROR] No parameters container found');
            return;
        }

        function attachEventListeners() {
            const params = document.querySelectorAll('#param_danger, #param_citoyensVille, #param_zombie');
            if (params.length === 0) {
                console.log('[ERROR] No parameters found');
            } else {
                params.forEach(param => {
                    param.removeEventListener('change', handleParameterChange);
                    param.addEventListener('change', handleParameterChange);
                    console.log(`[ATTACHED] Event listener attached to ${param.id}`);
                });
            }
        }

        const paramsObserver = new MutationObserver((mutationsList) => {
            //mutationsList.forEach((mutation) => {
            //    console.log('[OBSERVED] Mutation detected in parameters:', mutation);
            //});
            console.log('[OBSERVED] Parameters visibility or structure changed');
            attachEventListeners();
        });

        paramsObserver.observe(paramsContainer, { childList: true, subtree: true });
    }

    function observeTabs() {
        console.log('[EXECUTED] observeTabs');
        const tabsContainer = document.querySelector('#zoneInfoVilleAutre');

        if (!tabsContainer) {
            console.log('[ERROR] No tabs container found');
            return;
        }

        const tabObserver = new MutationObserver((mutationsList) => {
            let shouldUpdate = false;

            mutationsList.forEach((mutation) => {
                if (mutation.type === 'childList' || (mutation.type === 'attributes' && mutation.attributeName === 'class')) {
                    shouldUpdate = true;
                }
            });

            if (shouldUpdate) {
                console.log('[OBSERVED] Tab content or visibility changed');
                tabObserver.disconnect();
                displayParamTab();
                tabObserver.observe(tabsContainer, { childList: true, attributes: true, subtree: true });
            }
        });

        tabObserver.observe(tabsContainer, { childList: true, attributes: true, subtree: true });
        console.log('[STARTED] Observing tabs');
    }


    function applyModifications() {
        console.log('[EXECUTED] applyModifications');
        saveCitizenData();
        saveZombieData();
        removeUseHref();
        manageCitizenCases();
        invertCitizenDivs();
        applyCitizenColors();
        manageZombieCases();
        observeParameters();
        observeTabs();
        displayParamTab();
    }

    function startObservingMap() {
        const observer = new MutationObserver(() => {
            if (document.querySelector('.background_carte_color')) {
                addBackground();
                observer.disconnect();
                console.log('[LOADED] Map rows');
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    startObservingMap();
})();
