(function registerBalkanAuctionImport() {
  const IMPORT_EVENT = 'antiqueshop:balkanauction-imported';
  const fieldStyle = {
    width: '100%',
    padding: '12px',
    border: '1px solid #dfdfe3',
    borderRadius: '4px',
    boxSizing: 'border-box',
    font: 'inherit',
  };

  const BalkanAuctionUrlControl = createClass({
    getInitialState() {
      return { loading: false, message: '', isError: false };
    },

    isValid() {
      const value = String(this.props.value || '').trim();
      if (!value) return true;

      try {
        const url = new URL(value);
        const host = url.hostname.toLowerCase().replace(/\.$/, '');
        return ['balkanauction.com', 'www.balkanauction.com'].includes(host) &&
          /^\/(?:[a-z]{2}\/)?auction\/\d+\/?$/i.test(url.pathname);
      } catch {
        return false;
      }
    },

    async fillFields() {
      const url = String(this.props.value || '').trim();
      if (!url) {
        this.setState({ message: 'Поставете URL адрес на продукт.', isError: true });
        return;
      }

      this.setState({ loading: true, message: '', isError: false });

      try {
        const response = await fetch('/api/import-balkanauction', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ url }),
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(result.error || 'Продуктът не може да бъде импортиран.');
        }

        window.dispatchEvent(new CustomEvent(IMPORT_EVENT, { detail: result }));
        this.setState({
          loading: false,
          message: 'Заглавието, описанието и цената са попълнени.',
          isError: false,
        });
      } catch (error) {
        this.setState({
          loading: false,
          message: error.message || 'Продуктът не може да бъде импортиран.',
          isError: true,
        });
      }
    },

    render() {
      const { value, forID, classNameWrapper, onChange } = this.props;
      const { loading, message, isError } = this.state;

      return h('div', { className: classNameWrapper }, [
        h('div', { style: { display: 'flex', gap: '8px', alignItems: 'stretch' } }, [
          h('input', {
            id: forID,
            key: 'url',
            type: 'url',
            value: value || '',
            placeholder: 'https://balkanauction.com/en/auction/…',
            onChange: event => onChange(event.target.value),
            onKeyDown: event => {
              if (event.key === 'Enter') {
                event.preventDefault();
                this.fillFields();
              }
            },
            style: { ...fieldStyle, flex: '1 1 auto' },
          }),
          h('button', {
            key: 'button',
            type: 'button',
            disabled: loading,
            onClick: this.fillFields,
            style: {
              padding: '0 18px',
              border: 0,
              borderRadius: '4px',
              background: loading ? '#8b8b8b' : '#3a69c7',
              color: '#fff',
              cursor: loading ? 'wait' : 'pointer',
              font: 'inherit',
              fontWeight: 600,
            },
          }, loading ? 'Попълване…' : 'Попълни'),
        ]),
        message
          ? h('div', {
              key: 'message',
              role: isError ? 'alert' : 'status',
              style: { marginTop: '8px', color: isError ? '#c62828' : '#2e7d32' },
            }, message)
          : null,
      ]);
    },
  });

  function createImportableControl(fieldName, element, convertValue) {
    return createClass({
      componentDidMount() {
        this.importListener = event => {
          if (Object.prototype.hasOwnProperty.call(event.detail || {}, fieldName)) {
            this.props.onChange(convertValue(event.detail[fieldName]));
          }
        };
        window.addEventListener(IMPORT_EVENT, this.importListener);
      },

      componentWillUnmount() {
        window.removeEventListener(IMPORT_EVENT, this.importListener);
      },

      render() {
        const { value, forID, classNameWrapper, onChange } = this.props;
        const isNumber = element === 'input-number';
        const tagName = isNumber ? 'input' : element;
        const inputValue = value === null || value === undefined ? '' : value;

        return h('div', { className: classNameWrapper }, [
          h(tagName, {
            id: forID,
            type: isNumber ? 'number' : undefined,
            min: isNumber ? 0 : undefined,
            step: isNumber ? 'any' : undefined,
            rows: tagName === 'textarea' ? 8 : undefined,
            value: inputValue,
            onChange: event => {
              const nextValue = event.target.value;
              onChange(isNumber && nextValue !== '' ? Number(nextValue) : nextValue);
            },
            style: {
              ...fieldStyle,
              resize: tagName === 'textarea' ? 'vertical' : undefined,
              minHeight: tagName === 'textarea' ? '150px' : undefined,
            },
          }),
        ]);
      },
    });
  }

  const ImportableTitleControl = createImportableControl('title', 'input', String);
  const ImportableDescriptionControl = createImportableControl('description', 'textarea', String);
  const ImportablePriceControl = createImportableControl('price', 'input-number', Number);

  CMS.registerWidget('balkan-auction-url', BalkanAuctionUrlControl);
  CMS.registerWidget('importable-title', ImportableTitleControl);
  CMS.registerWidget('importable-description', ImportableDescriptionControl);
  CMS.registerWidget('importable-price', ImportablePriceControl);
})();
