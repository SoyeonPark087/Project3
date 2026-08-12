const { useEffect, useRef, useState } = React;
const model1 = './static/media/model-1.jpg';
const model2 = './static/media/model-2.jpg';
const model3 = './static/media/model-3.jpg';
const runtimeConfig = window.__PROJECT3_CONFIG__ || {};
const GOOGLE_SCRIPT_URL = runtimeConfig.googleScriptUrl || '';
const SOURCE_NAME = 'Project3';
const fields = [
    { icon: React.createElement(EyeIcon, null), title: '눈', description: '눈매·쌍꺼풀 등 눈 주변 상담' },
    { icon: React.createElement(NoseIcon, null), title: '코', description: '코 라인과 비율 관련 상담' },
    { icon: React.createElement(FaceIcon, null), title: '안면윤곽', description: '얼굴형과 전체 밸런스 상담' },
    { icon: React.createElement(BodyIcon, null), title: '가슴', description: '체형과 개인 조건에 맞춘 상담' },
    { icon: React.createElement(ShapeIcon, null), title: '체형', description: '지방·라인 등 바디 관련 상담' }
];
const steps = [
    ['01', '지원서 작성', '기본 고객정보를 간단히 입력합니다.'],
    ['02', '담당자 연락', '지원 내용 확인 후 개별 연락을 드립니다.'],
    ['03', '사진 확인', '필요한 경우 촬영 가이드를 안내합니다.'],
    ['04', '내원 상담', '전문의 상담을 통해 가능 여부를 확인합니다.'],
    ['05', '최종 선정', '조건과 촬영 범위를 확인한 후 최종 결정합니다.']
];
const initialForm = {
    name: '',
    email: '',
    phone: '',
    consent: false
};
function App() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState('idle');
    const [submitMessage, setSubmitMessage] = useState('');
    const firstInputRef = useRef(null);
    const triggerRef = useRef(null);
    const openModal = (event) => {
        triggerRef.current = (event === null || event === void 0 ? void 0 : event.currentTarget) || document.activeElement;
        setSubmitStatus('idle');
        setSubmitMessage('');
        setErrors({});
        setIsModalOpen(true);
    };
    const closeModal = () => {
        if (isSubmitting)
            return;
        setIsModalOpen(false);
        window.setTimeout(() => { var _a, _b; return (_b = (_a = triggerRef.current) === null || _a === void 0 ? void 0 : _a.focus) === null || _b === void 0 ? void 0 : _b.call(_a); }, 0);
    };
    useEffect(() => {
        if (!isModalOpen)
            return undefined;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.setTimeout(() => { var _a; return (_a = firstInputRef.current) === null || _a === void 0 ? void 0 : _a.focus(); }, 50);
        const onKeyDown = (event) => {
            if (event.key === 'Escape')
                closeModal();
        };
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', onKeyDown);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isModalOpen, isSubmitting]);
    const scrollToInfo = () => {
        var _a;
        (_a = document.getElementById('recruitment')) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: 'smooth' });
    };
    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
        if (submitStatus === 'error') {
            setSubmitStatus('idle');
            setSubmitMessage('');
        }
    };
    const formatPhone = (value) => {
        const onlyNumber = value.replace(/[^0-9]/g, '').slice(0, 11);
        if (onlyNumber.length < 4)
            return onlyNumber;
        if (onlyNumber.length < 8)
            return `${onlyNumber.slice(0, 3)}-${onlyNumber.slice(3)}`;
        return `${onlyNumber.slice(0, 3)}-${onlyNumber.slice(3, 7)}-${onlyNumber.slice(7)}`;
    };
    const handlePhoneChange = (event) => {
        const value = formatPhone(event.target.value);
        setForm((prev) => ({ ...prev, phone: value }));
        setErrors((prev) => ({ ...prev, phone: '' }));
    };
    const validate = () => {
        const next = {};
        const trimmedName = form.name.trim();
        const trimmedEmail = form.email.trim();
        const phoneDigits = form.phone.replace(/\D/g, '');
        if (trimmedName.length < 2)
            next.name = '이름을 2글자 이상 입력해주세요.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail))
            next.email = '올바른 이메일 주소를 입력해주세요.';
        if (!/^01[016789]\d{7,8}$/.test(phoneDigits))
            next.phone = '올바른 휴대전화 번호를 입력해주세요.';
        if (!form.consent)
            next.consent = '개인정보 수집 및 이용 동의가 필요합니다.';
        setErrors(next);
        return Object.keys(next).length === 0;
    };
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validate() || isSubmitting)
            return;
        if (!GOOGLE_SCRIPT_URL) {
            setSubmitStatus('error');
            setSubmitMessage('Google Sheets 연동 URL이 설정되지 않았습니다. .env 파일에 REACT_APP_GOOGLE_SCRIPT_URL을 설정한 뒤 다시 빌드해주세요.');
            return;
        }
        setIsSubmitting(true);
        setSubmitStatus('idle');
        setSubmitMessage('');
        try {
            const payload = new URLSearchParams({
                name: form.name.trim(),
                email: form.email.trim(),
                phone: form.phone.replace(/\D/g, ''),
                consent: form.consent ? 'Y' : 'N',
                source: SOURCE_NAME,
                status: '신규'
            });
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                },
                body: payload.toString()
            });
            setSubmitStatus('success');
            setSubmitMessage('신청이 완료되었습니다. 확인 후 담당자가 연락드리겠습니다.');
            setForm(initialForm);
            setErrors({});
        }
        catch (error) {
            console.error(error);
            setSubmitStatus('error');
            setSubmitMessage('신청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const resetAndClose = () => {
        setSubmitStatus('idle');
        setSubmitMessage('');
        closeModal();
    };
    return (React.createElement("div", { className: "app-shell" },
        React.createElement("header", { className: "site-header" },
            React.createElement("div", { className: "container header-inner" },
                React.createElement("a", { className: "brand", href: "#top", "aria-label": "Project3 \uD648" },
                    React.createElement("span", { className: "brand-mark" }, "P3"),
                    React.createElement("span", { className: "brand-text" }, "Model Project")),
                React.createElement("button", { className: "button button-small button-primary", onClick: openModal }, "\uBAA8\uB378 \uC9C0\uC6D0\uD558\uAE30"))),
        React.createElement("main", { id: "top" },
            React.createElement("section", { className: "hero section" },
                React.createElement("div", { className: "hero-orb hero-orb-one", "aria-hidden": "true" }),
                React.createElement("div", { className: "hero-orb hero-orb-two", "aria-hidden": "true" }),
                React.createElement("div", { className: "container hero-grid" },
                    React.createElement("div", { className: "hero-copy" },
                        React.createElement("span", { className: "eyebrow" }, "MODEL RECRUITMENT \u00B7 \uC0C1\uC2DC \uBAA8\uC9D1"),
                        React.createElement("h1", null,
                            "\uB2F9\uC2E0\uC758 \uBCC0\uD654\uAC00",
                            React.createElement("br", null),
                            React.createElement("span", null, "\uC0C8\uB85C\uC6B4 \uC774\uC57C\uAE30\uAC00 \uB429\uB2C8\uB2E4.")),
                        React.createElement("p", { className: "hero-description" }, "\uC2DC\uC220\u00B7\uC218\uC220 \uBAA8\uB378\uC744 \uBAA8\uC9D1\uD569\uB2C8\uB2E4. \uBCF5\uC7A1\uD55C \uC808\uCC28 \uC5C6\uC774 \uAE30\uBCF8 \uC815\uBCF4\uB97C \uB0A8\uAE30\uBA74 \uB2F4\uB2F9\uC790\uAC00 \uC9C0\uC6D0 \uAC00\uB2A5 \uC5EC\uBD80\uC640 \uC0C1\uB2F4 \uACFC\uC815\uC744 \uC548\uB0B4\uD574\uB4DC\uB9BD\uB2C8\uB2E4."),
                        React.createElement("div", { className: "hero-actions" },
                            React.createElement("button", { className: "button button-primary button-large", onClick: openModal },
                                "\uBAA8\uB378 \uC9C0\uC6D0\uD558\uAE30 ",
                                React.createElement(ArrowIcon, null)),
                            React.createElement("button", { className: "button button-ghost button-large", onClick: scrollToInfo }, "\uBAA8\uC9D1 \uB0B4\uC6A9 \uBCF4\uAE30")),
                        React.createElement("div", { className: "hero-note" },
                            React.createElement(CheckIcon, null),
                            " \uC0C1\uB2F4 \uC2E0\uCCAD\uB9CC\uC73C\uB85C \uC2DC\uC220\uC774 \uD655\uC815\uB418\uC9C0 \uC54A\uC73C\uBA70, \uCD5C\uC885 \uC5EC\uBD80\uB294 \uC0C1\uB2F4 \uD6C4 \uACB0\uC815\uB429\uB2C8\uB2E4.")),
                    React.createElement("div", { className: "hero-visual", "aria-label": "\uBAA8\uB378 \uC774\uBBF8\uC9C0" },
                        React.createElement("div", { className: "hero-badge" },
                            React.createElement(SparkleIcon, null),
                            " \uC120\uC815\uC790 \uC9C0\uC6D0 \uD61C\uD0DD"),
                        React.createElement("div", { className: "portrait-card portrait-card-main" },
                            React.createElement("img", { src: model1, alt: "\uBAA8\uB378 \uC608\uC2DC" })),
                        React.createElement("div", { className: "portrait-card portrait-card-small portrait-card-left" },
                            React.createElement("img", { src: model2, alt: "\uBAA8\uB378 \uC608\uC2DC" })),
                        React.createElement("div", { className: "portrait-card portrait-card-small portrait-card-right" },
                            React.createElement("img", { src: model3, alt: "\uBAA8\uB378 \uC608\uC2DC" })),
                        React.createElement("div", { className: "floating-chip floating-chip-top" },
                            React.createElement("span", null, "01"),
                            " \uAC04\uD3B8 \uC9C0\uC6D0"),
                        React.createElement("div", { className: "floating-chip floating-chip-bottom" },
                            React.createElement("span", null, "02"),
                            " \uAC1C\uBCC4 \uC0C1\uB2F4")))),
            React.createElement("section", { className: "quick-info-section" },
                React.createElement("div", { className: "container quick-info-grid" },
                    React.createElement(InfoPill, { label: "\uBAA8\uC9D1 \uAE30\uAC04", value: "\uC0C1\uC2DC \uBAA8\uC9D1" }),
                    React.createElement(InfoPill, { label: "\uC9C0\uC6D0 \uB300\uC0C1", value: "\uB9CC 19\uC138 \uC774\uC0C1" }),
                    React.createElement(InfoPill, { label: "\uC9C4\uD589 \uBC29\uC2DD", value: "\uAC1C\uBCC4 \uC0C1\uB2F4 \uD6C4 \uC120\uC815" }),
                    React.createElement(InfoPill, { label: "\uC9C0\uC6D0 \uD61C\uD0DD", value: "\uC120\uC815\uC790 \uBCC4\uB3C4 \uC548\uB0B4" }))),
            React.createElement("section", { className: "section", id: "recruitment" },
                React.createElement("div", { className: "container" },
                    React.createElement(SectionHeading, { kicker: "RECRUITMENT", title: "\uD55C\uB208\uC5D0 \uD655\uC778\uD558\uB294 \uBAA8\uC9D1 \uC548\uB0B4", description: "\uD544\uC694\uD55C \uC815\uBCF4\uB9CC \uAC04\uACB0\uD558\uAC8C \uD655\uC778\uD558\uACE0 \uBC14\uB85C \uC9C0\uC6D0\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4." }),
                    React.createElement("div", { className: "recruit-grid" },
                        React.createElement("article", { className: "card feature-card feature-card-wide" },
                            React.createElement("div", { className: "icon-box" },
                                React.createElement(CalendarIcon, null)),
                            React.createElement("div", null,
                                React.createElement("span", { className: "card-label" }, "\uBAA8\uC9D1 \uAE30\uAC04"),
                                React.createElement("h3", null, "\uC0C1\uC2DC \uBAA8\uC9D1"),
                                React.createElement("p", null, "\uBAA8\uC9D1 \uD604\uD669\uC5D0 \uB530\uB77C \uC811\uC218 \uD6C4 \uC5F0\uB77D\uAE4C\uC9C0 \uC77C\uC815 \uC2DC\uAC04\uC774 \uC18C\uC694\uB420 \uC218 \uC788\uC2B5\uB2C8\uB2E4."))),
                        React.createElement("article", { className: "card feature-card" },
                            React.createElement("div", { className: "icon-box" },
                                React.createElement(UserIcon, null)),
                            React.createElement("div", null,
                                React.createElement("span", { className: "card-label" }, "\uBAA8\uC9D1 \uB300\uC0C1"),
                                React.createElement("h3", null, "\uB9CC 19\uC138 \uC774\uC0C1 \uC131\uC778"),
                                React.createElement("p", null, "\uBBF8\uC131\uB144\uC790\uB294 \uC9C0\uC6D0\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4."))),
                        React.createElement("article", { className: "card feature-card accent-card" },
                            React.createElement("div", { className: "icon-box" },
                                React.createElement(GiftIcon, null)),
                            React.createElement("div", null,
                                React.createElement("span", { className: "card-label" }, "\uC9C0\uC6D0 \uD61C\uD0DD"),
                                React.createElement("h3", null, "\uC120\uC815 \uB300\uC0C1\uC790 \uBE44\uC6A9 \uC9C0\uC6D0"),
                                React.createElement("p", null, "\uC9C0\uC6D0 \uBC94\uC704\uB294 \uC0C1\uB2F4 \uBC0F \uC120\uC815 \uC870\uAC74\uC5D0 \uB530\uB77C \uAC1C\uBCC4 \uC548\uB0B4\uB429\uB2C8\uB2E4.")))))),
            React.createElement("section", { className: "section section-soft" },
                React.createElement("div", { className: "container" },
                    React.createElement(SectionHeading, { kicker: "FIELDS", title: "\uBAA8\uC9D1 \uBD84\uC57C", description: "\uAD00\uC2EC \uC788\uB294 \uBD84\uC57C\uAC00 \uC788\uB2E4\uBA74 \uC0C1\uB2F4 \uC2E0\uCCAD \uC2DC \uB2F4\uB2F9\uC790\uC5D0\uAC8C \uD3B8\uD558\uAC8C \uB9D0\uC500\uD574\uC8FC\uC138\uC694." }),
                    React.createElement("div", { className: "field-grid" }, fields.map((item) => (React.createElement("article", { className: "field-card", key: item.title },
                        React.createElement("div", { className: "field-icon" }, item.icon),
                        React.createElement("h3", null, item.title),
                        React.createElement("p", null, item.description))))))),
            React.createElement("section", { className: "section" },
                React.createElement("div", { className: "container" },
                    React.createElement(SectionHeading, { kicker: "PROCESS", title: "\uC9C0\uC6D0\uC740 5\uB2E8\uACC4\uB85C \uC9C4\uD589\uB429\uB2C8\uB2E4", description: "\uC9C0\uC6D0\uC11C\uB97C \uC791\uC131\uD55C \uB4A4 \uB2F4\uB2F9\uC790 \uC548\uB0B4\uC5D0 \uB530\uB77C \uD544\uC694\uD55C \uB2E8\uACC4\uB9CC \uC9C4\uD589\uD569\uB2C8\uB2E4." }),
                    React.createElement("div", { className: "process-list" }, steps.map(([number, title, description], index) => (React.createElement(React.Fragment, { key: number },
                        React.createElement("article", { className: "process-item" },
                            React.createElement("span", { className: "process-number" }, number),
                            React.createElement("div", null,
                                React.createElement("h3", null, title),
                                React.createElement("p", null, description))),
                        index < steps.length - 1 && React.createElement("span", { className: "process-arrow", "aria-hidden": "true" }, "\u2192"))))))),
            React.createElement("section", { className: "section section-soft" },
                React.createElement("div", { className: "container two-column-section" },
                    React.createElement("div", null,
                        React.createElement(SectionHeading, { kicker: "BEFORE APPLY", title: "\uC9C0\uC6D0 \uC804 \uD655\uC778\uD574\uC8FC\uC138\uC694", description: "\uBAA8\uB378 \uBAA8\uC9D1\uC740 \uC77C\uBC18 \uC0C1\uB2F4\uACFC \uB2EC\uB9AC \uCD2C\uC601 \uBC0F \uD64D\uBCF4 \uD65C\uC6A9 \uAC00\uB2A5 \uC5EC\uBD80 \uD655\uC778\uC774 \uD3EC\uD568\uB420 \uC218 \uC788\uC2B5\uB2C8\uB2E4.", align: "left" }),
                        React.createElement("ul", { className: "notice-list" },
                            React.createElement(NoticeItem, null, "\uBAA8\uB378 \uCD2C\uC601\uBB3C\uC740 \uBCD1\uC6D0 \uD64D\uBCF4 \uCF58\uD150\uCE20 \uC81C\uC791\uC5D0 \uD65C\uC6A9\uB420 \uC218 \uC788\uC2B5\uB2C8\uB2E4."),
                            React.createElement(NoticeItem, null, "\uC9C0\uC6D0 \uD6C4 \uB2F4\uB2F9\uC790\uC758 \uAC1C\uBCC4 \uC5F0\uB77D\uC774 \uC9C4\uD589\uB420 \uC218 \uC788\uC2B5\uB2C8\uB2E4."),
                            React.createElement(NoticeItem, null, "\uC9C0\uC6D0\uB9CC\uC73C\uB85C \uBAA8\uB378 \uC120\uC815\uC774\uB098 \uC2DC\uC220 \uC9C4\uD589\uC774 \uD655\uC815\uB418\uC9C0\uB294 \uC54A\uC2B5\uB2C8\uB2E4."),
                            React.createElement(NoticeItem, null, "\uC2E4\uC81C \uC2DC\uC220\u00B7\uCD2C\uC601 \uBC94\uC704\uC640 \uC9C0\uC6D0 \uD61C\uD0DD\uC740 \uC0C1\uB2F4 \uD6C4 \uD655\uC815\uB429\uB2C8\uB2E4."),
                            React.createElement(NoticeItem, null, "\uD5C8\uC704 \uC815\uBCF4 \uC785\uB825 \uC2DC \uC120\uC815\uC774 \uCDE8\uC18C\uB420 \uC218 \uC788\uC2B5\uB2C8\uB2E4."))),
                    React.createElement("div", { className: "notice-visual card" },
                        React.createElement("div", { className: "notice-visual-header" },
                            React.createElement(ShieldIcon, null),
                            " \uC548\uC804\uD55C \uC0C1\uB2F4\uC744 \uC704\uD55C \uC548\uB0B4"),
                        React.createElement("div", { className: "notice-stat" },
                            React.createElement("strong", null, "01"),
                            React.createElement("span", null, "\uC0C1\uB2F4 \uC804 \uC815\uBCF4 \uD655\uC778")),
                        React.createElement("div", { className: "notice-stat" },
                            React.createElement("strong", null, "02"),
                            React.createElement("span", null, "\uAC1C\uBCC4 \uC870\uAC74 \uAC80\uD1A0")),
                        React.createElement("div", { className: "notice-stat" },
                            React.createElement("strong", null, "03"),
                            React.createElement("span", null, "\uCDA9\uBD84\uD55C \uC124\uBA85 \uD6C4 \uACB0\uC815")),
                        React.createElement("p", null, "\uCD5C\uC885\uC801\uC778 \uC758\uB8CC\uD589\uC704 \uC5EC\uBD80\uB294 \uC758\uB8CC\uC9C4\uC758 \uC9C4\uB8CC\uC640 \uC0C1\uB2F4\uC744 \uD1B5\uD574 \uACB0\uC815\uB429\uB2C8\uB2E4.")))),
            React.createElement("section", { className: "section photo-guide-section" },
                React.createElement("div", { className: "container" },
                    React.createElement(SectionHeading, { kicker: "PHOTO GUIDE", title: "\uC0AC\uC9C4 \uC900\uBE44 \uAC00\uC774\uB4DC", description: "\uC120\uC815 \uACFC\uC815\uC5D0\uC11C \uCD94\uAC00 \uC0AC\uC9C4\uC774 \uD544\uC694\uD55C \uACBD\uC6B0 \uB2F4\uB2F9\uC790\uAC00 \uC544\uB798 \uAE30\uC900\uC744 \uC548\uB0B4\uD569\uB2C8\uB2E4." }),
                    React.createElement("div", { className: "photo-guide-grid" },
                        React.createElement(PhotoGuideCard, { title: "\uC5BC\uAD74 \uC0AC\uC9C4", description: "\uCD5C\uADFC \uCD2C\uC601\uD55C \uC0AC\uC9C4\uC744 \uC0AC\uC6A9\uD558\uACE0 \uACFC\uB3C4\uD55C \uBCF4\uC815\uC740 \uD53C\uD574\uC8FC\uC138\uC694.", labels: ['정면', '45도', '측면'], type: "face" }),
                        React.createElement(PhotoGuideCard, { title: "\uC2E0\uCCB4 \uC0AC\uC9C4", description: "\uCCB4\uD615 \uAD00\uB828 \uBAA8\uC9D1 \uB300\uC0C1\uC790\uC5D0\uAC8C\uB9CC \uBCC4\uB3C4 \uC548\uB0B4\uB420 \uC218 \uC788\uC2B5\uB2C8\uB2E4.", labels: ['정면', '45도', '측면'], type: "body" })),
                    React.createElement("div", { className: "guide-note" },
                        React.createElement(InfoIcon, null),
                        " 1\uCC28 \uC9C0\uC6D0\uC5D0\uC11C\uB294 \uC0AC\uC9C4 \uC5C5\uB85C\uB4DC\uAC00 \uD544\uC694\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uC774\uB984, \uC774\uBA54\uC77C, \uC804\uD654\uBC88\uD638\uB9CC \uC785\uB825\uD558\uBA74 \uB429\uB2C8\uB2E4."))),
            React.createElement("section", { className: "section cta-section" },
                React.createElement("div", { className: "container" },
                    React.createElement("div", { className: "cta-panel" },
                        React.createElement("div", null,
                            React.createElement("span", { className: "eyebrow eyebrow-light" }, "READY TO APPLY?"),
                            React.createElement("h2", null,
                                "\uAD81\uAE08\uD55C \uC810\uC774 \uC788\uB2E4\uBA74",
                                React.createElement("br", null),
                                "\uC9C0\uC6D0 \uC804\uC5D0 \uBA3C\uC800 \uC0C1\uB2F4\uD574\uBCF4\uC138\uC694."),
                            React.createElement("p", null, "\uAE30\uBCF8 \uC815\uBCF4\uB97C \uB0A8\uACA8\uC8FC\uC2DC\uBA74 \uD655\uC778 \uD6C4 \uB2F4\uB2F9\uC790\uAC00 \uC548\uB0B4\uD574\uB4DC\uB9BD\uB2C8\uB2E4.")),
                        React.createElement("button", { className: "button button-white button-large", onClick: openModal },
                            "\uC0C1\uB2F4 \uC2E0\uCCAD\uD558\uAE30 ",
                            React.createElement(ArrowIcon, null)))))),
        React.createElement("footer", { className: "site-footer" },
            React.createElement("div", { className: "container footer-grid" },
                React.createElement("div", null,
                    React.createElement("div", { className: "brand footer-brand" },
                        React.createElement("span", { className: "brand-mark" }, "P3"),
                        React.createElement("span", { className: "brand-text" }, "Model Project")),
                    React.createElement("p", null, "\uC131\uD615\uC678\uACFC \uBAA8\uB378 \uBAA8\uC9D1 \uBC0F \uC0C1\uB2F4 \uC2E0\uCCAD \uD398\uC774\uC9C0")),
                React.createElement("div", { className: "footer-info" },
                    React.createElement("span", null, "\uC6B4\uC601 \uC815\uBCF4\uB294 \uC2E4\uC81C \uBCD1\uC6D0 \uC815\uBCF4\uB85C \uAD50\uCCB4\uD574\uC8FC\uC138\uC694."),
                    React.createElement("span", null, "\u00A9 2026 Project3. All rights reserved.")))),
        isModalOpen && (React.createElement("div", { className: "modal-overlay", role: "presentation", onMouseDown: (e) => e.target === e.currentTarget && closeModal() },
            React.createElement("div", { className: "modal-card", role: "dialog", "aria-modal": "true", "aria-labelledby": "application-title" },
                React.createElement("button", { className: "modal-close", onClick: closeModal, "aria-label": "\uD31D\uC5C5 \uB2EB\uAE30", disabled: isSubmitting },
                    React.createElement(CloseIcon, null)),
                submitStatus === 'success' ? (React.createElement("div", { className: "result-view" },
                    React.createElement("div", { className: "result-icon success" },
                        React.createElement(CheckIcon, null)),
                    React.createElement("span", { className: "eyebrow" }, "APPLICATION COMPLETE"),
                    React.createElement("h2", null, "\uC2E0\uCCAD\uC774 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4."),
                    React.createElement("p", null, submitMessage),
                    React.createElement("button", { className: "button button-primary button-large full-width", onClick: resetAndClose }, "\uD655\uC778"))) : (React.createElement(React.Fragment, null,
                    React.createElement("div", { className: "modal-heading" },
                        React.createElement("span", { className: "eyebrow" }, "QUICK APPLICATION"),
                        React.createElement("h2", { id: "application-title" }, "\uBAA8\uB378 \uC9C0\uC6D0 / \uC0C1\uB2F4 \uC2E0\uCCAD"),
                        React.createElement("p", null, "\uC544\uB798 \uC815\uBCF4\uB97C \uB0A8\uACA8\uC8FC\uC2DC\uBA74 \uB2F4\uB2F9\uC790\uAC00 \uC9C0\uC6D0 \uAC00\uB2A5 \uC5EC\uBD80\uC640 \uB2E4\uC74C \uC808\uCC28\uB97C \uC548\uB0B4\uD574\uB4DC\uB9BD\uB2C8\uB2E4.")),
                    React.createElement("form", { onSubmit: handleSubmit, noValidate: true },
                        React.createElement("div", { className: "form-group" },
                            React.createElement("label", { htmlFor: "name" },
                                "\uC774\uB984 ",
                                React.createElement("em", null, "\uD544\uC218")),
                            React.createElement("input", { ref: firstInputRef, id: "name", name: "name", type: "text", autoComplete: "name", placeholder: "\uC774\uB984\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694", value: form.name, onChange: handleChange, "aria-invalid": Boolean(errors.name) }),
                            errors.name && React.createElement("span", { className: "error-text" }, errors.name)),
                        React.createElement("div", { className: "form-group" },
                            React.createElement("label", { htmlFor: "email" },
                                "\uC774\uBA54\uC77C ",
                                React.createElement("em", null, "\uD544\uC218")),
                            React.createElement("input", { id: "email", name: "email", type: "email", autoComplete: "email", placeholder: "example@email.com", value: form.email, onChange: handleChange, "aria-invalid": Boolean(errors.email) }),
                            errors.email && React.createElement("span", { className: "error-text" }, errors.email)),
                        React.createElement("div", { className: "form-group" },
                            React.createElement("label", { htmlFor: "phone" },
                                "\uC804\uD654\uBC88\uD638 ",
                                React.createElement("em", null, "\uD544\uC218")),
                            React.createElement("input", { id: "phone", name: "phone", type: "tel", inputMode: "numeric", autoComplete: "tel", placeholder: "010-1234-5678", value: form.phone, onChange: handlePhoneChange, "aria-invalid": Boolean(errors.phone) }),
                            errors.phone && React.createElement("span", { className: "error-text" }, errors.phone)),
                        React.createElement("div", { className: `consent-box ${errors.consent ? 'has-error' : ''}` },
                            React.createElement("label", { className: "checkbox-row" },
                                React.createElement("input", { type: "checkbox", name: "consent", checked: form.consent, onChange: handleChange }),
                                React.createElement("span", { className: "custom-checkbox" },
                                    React.createElement(CheckIcon, null)),
                                React.createElement("span", null,
                                    React.createElement("strong", null, "[\uD544\uC218]"),
                                    " \uAC1C\uC778\uC815\uBCF4 \uC218\uC9D1 \uBC0F \uC774\uC6A9\uC5D0 \uB3D9\uC758\uD569\uB2C8\uB2E4.")),
                            React.createElement("details", null,
                                React.createElement("summary", null, "\uAC1C\uC778\uC815\uBCF4 \uC218\uC9D1 \uC548\uB0B4 \uBCF4\uAE30"),
                                React.createElement("div", { className: "privacy-details" },
                                    React.createElement("p", null,
                                        React.createElement("strong", null, "\uC218\uC9D1 \uD56D\uBAA9"),
                                        " \uC774\uB984, \uC774\uBA54\uC77C, \uC804\uD654\uBC88\uD638"),
                                    React.createElement("p", null,
                                        React.createElement("strong", null, "\uC218\uC9D1 \uBAA9\uC801"),
                                        " \uBAA8\uB378 \uC9C0\uC6D0 \uC811\uC218, \uC0C1\uB2F4 \uBC0F \uC5F0\uB77D"),
                                    React.createElement("p", null,
                                        React.createElement("strong", null, "\uBCF4\uC720 \uAE30\uAC04"),
                                        " \uC2E4\uC81C \uC6B4\uC601 \uC815\uCC45\uC5D0 \uB9DE\uB294 \uAE30\uAC04\uC73C\uB85C \uBC30\uD3EC \uC804 \uBC18\uB4DC\uC2DC \uC218\uC815"),
                                    React.createElement("p", null, "\uB3D9\uC758\uB97C \uAC70\uBD80\uD560 \uC218 \uC788\uC73C\uB098, \uD544\uC218 \uC815\uBCF4 \uC218\uC9D1\uC5D0 \uB3D9\uC758\uD558\uC9C0 \uC54A\uC73C\uBA74 \uC0C1\uB2F4 \uC2E0\uCCAD\uC774 \uC81C\uD55C\uB429\uB2C8\uB2E4."))),
                            errors.consent && React.createElement("span", { className: "error-text" }, errors.consent)),
                        submitStatus === 'error' && React.createElement("div", { className: "submit-alert" },
                            React.createElement(AlertIcon, null),
                            " ",
                            React.createElement("span", null, submitMessage)),
                        React.createElement("button", { className: "button button-primary button-large full-width submit-button", type: "submit", disabled: isSubmitting }, isSubmitting ? React.createElement(React.Fragment, null,
                            React.createElement("span", { className: "spinner" }),
                            " \uC2E0\uCCAD \uC911...") : React.createElement(React.Fragment, null,
                            "\uC2E0\uCCAD\uD558\uAE30 ",
                            React.createElement(ArrowIcon, null))),
                        React.createElement("p", { className: "form-footnote" }, "\uC2E0\uCCAD \uC811\uC218\uB294 \uBAA8\uB378 \uC120\uC815 \uB610\uB294 \uC2DC\uC220 \uD655\uC815\uC744 \uC758\uBBF8\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.")))))))));
}
function SectionHeading({ kicker, title, description, align = 'center' }) {
    return (React.createElement("div", { className: `section-heading ${align === 'left' ? 'align-left' : ''}` },
        React.createElement("span", { className: "eyebrow" }, kicker),
        React.createElement("h2", null, title),
        React.createElement("p", null, description)));
}
function InfoPill({ label, value }) {
    return React.createElement("div", { className: "info-pill" },
        React.createElement("span", null, label),
        React.createElement("strong", null, value));
}
function NoticeItem({ children }) {
    return React.createElement("li", null,
        React.createElement("span", { className: "notice-check" },
            React.createElement(CheckIcon, null)),
        React.createElement("span", null, children));
}
function PhotoGuideCard({ title, description, labels, type }) {
    return (React.createElement("article", { className: "photo-card card" },
        React.createElement("div", { className: "photo-card-heading" },
            React.createElement("div", null,
                React.createElement("h3", null, title),
                React.createElement("p", null, description)),
            React.createElement(CameraIcon, null)),
        React.createElement("div", { className: "angle-grid" }, labels.map((label, index) => (React.createElement("div", { className: "angle-item", key: `${type}-${label}` },
            React.createElement("div", { className: `angle-figure ${type}`, "data-angle": index }, type === 'face' ? React.createElement(FaceGuideIcon, null) : React.createElement(BodyGuideIcon, null)),
            React.createElement("span", null, label)))))));
}
function IconBase({ children, size = 24, viewBox = '0 0 24 24', ...props }) {
    return React.createElement("svg", { width: size, height: size, viewBox: viewBox, fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", ...props }, children);
}
function ArrowIcon() { return React.createElement(IconBase, { size: 20 },
    React.createElement("path", { d: "M5 12h14M13 6l6 6-6 6" })); }
function CheckIcon() { return React.createElement(IconBase, { size: 18 },
    React.createElement("path", { d: "m5 9 4 4L19 3" })); }
function SparkleIcon() { return React.createElement(IconBase, { size: 18 },
    React.createElement("path", { d: "M12 3l1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3ZM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Z" })); }
function CalendarIcon() { return React.createElement(IconBase, null,
    React.createElement("rect", { x: "3", y: "5", width: "18", height: "16", rx: "3" }),
    React.createElement("path", { d: "M8 3v4M16 3v4M3 10h18" })); }
function UserIcon() { return React.createElement(IconBase, null,
    React.createElement("circle", { cx: "12", cy: "8", r: "4" }),
    React.createElement("path", { d: "M4 21c.8-4 3.5-6 8-6s7.2 2 8 6" })); }
function GiftIcon() { return React.createElement(IconBase, null,
    React.createElement("rect", { x: "3", y: "8", width: "18", height: "13", rx: "2" }),
    React.createElement("path", { d: "M12 8v13M3 12h18M12 8H8.2C5.5 8 5 4 7.4 4c2.2 0 4.6 4 4.6 4Zm0 0h3.8c2.7 0 3.2-4 .8-4C14.4 4 12 8 12 8Z" })); }
function EyeIcon() { return React.createElement(IconBase, null,
    React.createElement("path", { d: "M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" }),
    React.createElement("circle", { cx: "12", cy: "12", r: "2.5" })); }
function NoseIcon() { return React.createElement(IconBase, null,
    React.createElement("path", { d: "M13 3c-1 4-2 7-2.7 10-.4 1.8.6 3 2.4 3h2.8M9 19c1 .8 2 .9 3 .9s2-.2 3-.9" })); }
function FaceIcon() { return React.createElement(IconBase, null,
    React.createElement("path", { d: "M8 3c-3 2-4 5-4 9 0 5 3.5 9 8 9s8-4 8-9c0-4-1-7-4-9M8 3c1 2 7 2 8 0" }),
    React.createElement("path", { d: "M8.5 11h.01M15.5 11h.01M9 16c2 1.2 4 1.2 6 0" })); }
function BodyIcon() { return React.createElement(IconBase, null,
    React.createElement("path", { d: "M9 3c.3 2-.4 3.5-2 5-1.5 1.5-2 3.2-1.5 5.2L8 21M15 3c-.3 2 .4 3.5 2 5 1.5 1.5 2 3.2 1.5 5.2L16 21M9 9c1.5 1 4.5 1 6 0M8 15c2 1 6 1 8 0" })); }
function ShapeIcon() { return React.createElement(IconBase, null,
    React.createElement("path", { d: "M8 4c1 3 0 5-2 7-2 2-2 5 0 9M16 4c-1 3 0 5 2 7 2 2 2 5 0 9M8 7c2 2 6 2 8 0M6 15c4-1 8-1 12 0" })); }
function ShieldIcon() { return React.createElement(IconBase, null,
    React.createElement("path", { d: "M12 3 20 6v5c0 5-3 8-8 10-5-2-8-5-8-10V6l8-3Z" }),
    React.createElement("path", { d: "m8.5 12 2.2 2.2 4.8-5" })); }
function InfoIcon() { return React.createElement(IconBase, { size: 19 },
    React.createElement("circle", { cx: "12", cy: "12", r: "9" }),
    React.createElement("path", { d: "M12 11v5M12 8h.01" })); }
function CameraIcon() { return React.createElement(IconBase, null,
    React.createElement("path", { d: "M4 7h3l1.5-2h7L17 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" }),
    React.createElement("circle", { cx: "12", cy: "13", r: "4" })); }
function CloseIcon() { return React.createElement(IconBase, null,
    React.createElement("path", { d: "m6 6 12 12M18 6 6 18" })); }
function AlertIcon() { return React.createElement(IconBase, { size: 20 },
    React.createElement("path", { d: "M12 3 2.8 19h18.4L12 3Z" }),
    React.createElement("path", { d: "M12 9v4M12 16h.01" })); }
function FaceGuideIcon() { return React.createElement(IconBase, { size: 50 },
    React.createElement("ellipse", { cx: "12", cy: "11", rx: "7", ry: "9" }),
    React.createElement("path", { d: "M8.5 11h.01M15.5 11h.01M9 16c2 1 4 1 6 0M7 5c3-3 8-3 10 0" })); }
function BodyGuideIcon() { return React.createElement(IconBase, { size: 50 },
    React.createElement("circle", { cx: "12", cy: "5", r: "3" }),
    React.createElement("path", { d: "M8 21v-6l-2-5c-.5-1.5.5-3 2-3h8c1.5 0 2.5 1.5 2 3l-2 5v6M8 14h8M12 8v6" })); }
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(React.StrictMode, null,
    React.createElement(App, null)));
