import React, {useState, useRef, useEffect}  from 'react';
import loading from './images/loading.svg';

const App: React.FC = () => {
  const [state, setState] = useState({loading: true, usdCost: '', data: '', orderBook: '', buyQuantity: '', sellAvailable: 0, buyAvailable: 0, sellTotal: 0, buyTotal: 0, totals: '', spread:0});
  const usdCost = useRef<HTMLInputElement>(null);



useEffect(() => {
  const getOrderBook = async() => {
    console.log('fetching');
    try {
    const response = await fetch('https://cors-anywhere.herokuapp.com/https://api.chainrift.com/v1/Public/GetOrderBook?symbol=WBIUSDT', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    });
    const content = await response.json();

    if (content && content.data) {
    let sellTotal: number = 0;
    let buyTotal: number = 0;
    let sellValue: number = 0;
    let buyValue: number = 0;
    let sellSpread: number = 0;
    let buySpread: number = 0;
    let sellData: any = [];
    const arrayLength = content.data.length;

    for (var i = 0; i < arrayLength; i++) {
      if (content.data[i].type === 'Sell') {
        sellTotal += content.data[i].quantity;
        sellValue += (content.data[i].quantity * content.data[i].price);
        if (sellSpread === 0) {sellSpread = content.data[i].price}
        sellData.push(content.data[i])
      };
      if (content.data[i].type === 'Buy') {
        buyTotal += content.data[i].quantity;
        buyValue += (content.data[i].quantity * content.data[i].price);
        buySpread = content.data[i].price;
      };
    }
    const spread = sellSpread - buySpread ;
    const orderBook = content.data.map((item: any, key: any) => <span key={key} className={item.type}><div>{item.type}</div><div>{'WBI ' + item.quantity}</div><div>{'$ ' + item.price}</div><div>{'$ ' +Number(item.price*item.quantity).toLocaleString('en')}</div></span>);
    setState({...state, loading: false, data: JSON.stringify(sellData), spread, orderBook, sellAvailable: sellTotal, buyAvailable: buyTotal, sellTotal: sellValue, buyTotal: buyValue});  
  }
}
  catch(error) {
    console.log(error);
  }
}
  if (!state.orderBook) {
      getOrderBook();
  }
}, [state]);

const submitForm = () => {
  const data = JSON.parse(state.data);
  const arrayLength = data.length;
  let buyQuantity = parseFloat(state.buyQuantity);
  let total = 0;

  for (var i = 0; i < arrayLength; i++) {
    if (buyQuantity > 0  && buyQuantity < data[i].quantity) {
      total += buyQuantity * data[i].price;
      console.log(`you just perchased ${buyQuantity} at the price of ${data[i].price} a toal spend of ${total}`)
      buyQuantity = 0;
      console.log('You have 0 left to buy')
    } else if (buyQuantity > 0 && buyQuantity > data[i].quantity) {
      total += data[i].quantity * data[i].price;
      console.log(`you just perchased ${data[i].quantity} at the price of ${data[i].price} a toal spend of ${total}`)
      buyQuantity = buyQuantity -= data[i].quantity;
      console.log(`You have ${buyQuantity} left to buy`)
    }
  }

  setState({...state, usdCost: `$  ${Number(total).toLocaleString('en')}`});
  
}

const formValue = (event: React.ChangeEvent<HTMLInputElement>) => {
  setState({...state, [event.target.name]: event.target.value})
}
// const formValue = (event: React.ChangeEvent<HTMLInputElement>) => {
//   getOrderBook(parseFloat(event.target.value));
// }

   const buyQuantity = useRef<HTMLInputElement>(null);

  return (
    <div className="layout-grid">
      <div className='layout-title'>WBIxUSDT order book price calculator</div>

      <div className='section-grid'>
        <div>Quantity</div>
        <div>
          <label>Buy WBI Quantity</label>
          <input type="number" value={state.buyQuantity} name="buyQuantity" onChange={formValue} ref={buyQuantity}/>
        </div>
      </div>
      <div className='section-grid'>
        <div>Orderbook</div>
        <div>
          <div className='data-grid'>
            {state.orderBook}
          </div>
          <hr/>
          <div className='data-grid-totals'>
            <span><b>Buy Total:</b><div>$ {Number(state.buyTotal).toLocaleString('en')}</div><div></div></span>
            <span><b>Buy Volume:</b><div>WBI {Number(state.buyAvailable).toLocaleString('en')}</div><div></div></span>
          </div>
          <hr/>
          <div className='data-grid-totals'>
            <span><b>Sell Total:</b><div>$ {Number(state.sellTotal).toLocaleString('en')}</div><div></div></span>
            <span><b>Sell Volume:</b><div>WBI {Number(state.sellAvailable).toLocaleString('en')}</div><div></div></span>
          </div>
          <hr/>
          <div className='data-grid-totals'>
            <span><b>Spread:</b><div>$ {Number(state.spread).toLocaleString('en')}</div><div></div></span>
          </div>
        </div>
      </div>

      <div className='section-grid'>
        <div>Cost</div>
        <div>
          <label>Total USD Cost</label>
          <input type="text" readOnly value={state.usdCost} ref={usdCost} />
        </div>
      </div>

      <div className='section-grid'>
        <small>Order book fetched from Chinarift</small>
        <div className='btn-grid'>
          <div></div>
          <button onClick={submitForm}>
          {!state.loading ? 'Calculate' : <img src={loading} alt="loading" className='loading'/>}
            </button>
        </div>
      </div>
    </div>

    
  );
}

export default App;
