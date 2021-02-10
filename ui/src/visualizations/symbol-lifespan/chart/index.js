'use strict';

import React from 'react';
import cx from 'classnames';

import styles from '../styles.scss';
import { Mock } from '../mock';

export default class SymbolLifespanChart extends React.PureComponent {
  constructor(props) {
    super(props);
    this.containerRef = null;
    this.items = Mock.searchResults(10, 0.02);
    this.days = this.mockDays();
    this.setContainerRef = element => {
      this.containerRef = element;
    };
  }

  mockItems() {
    const n = 10;
    const evp = 0.02;
    const items = [];
    const rand = (a, b) => (b ? a : 0) + Math.floor(Math.random() * (b ? b - a : a));
    const randChar = () => String.fromCharCode(rand(97, 97 + 26));
    const randType = () => ['instance', 'class'][rand(2)];
    const randEvent = () => ['rename', 'move', 'change'][rand(3)];
    const justDate = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const incDate = d => justDate(new Date(new Date(d).setDate(d.getDate() + 1)));
    const decDate = d => justDate(new Date(new Date(d).setDate(d.getDate() - 1)));
    const minDate = new Date(Date.UTC(2020, 9, 1));
    const maxDate = new Date(Date.UTC(2020, 11, 31));
    const mid = (+maxDate - +minDate) / 2;
    for (let i = 0; i < n; i++) {
      const rs = randChar() + randChar() + randChar();
      const symbol = rs + 'Loader';
      const type = randType();
      const scope = 'LoadersGroup';
      const file = 'src/components/loaders/LoadersGroup.js';
      const start = justDate(new Date(rand(+minDate, +maxDate - mid)));
      const end = justDate(new Date(rand(+minDate + mid, +maxDate)));
      const s1 = incDate(start);
      const e1 = decDate(end);
      const events = [];
      for (let d = s1; +d <= +e1; d = incDate(d)) {
        const r = Math.random();
        if (r < evp) {
          events.push({
            date: d,
            type: randEvent()
          });
        }
      }
      items.push({
        symbol,
        type,
        scope,
        file,
        start,
        end,
        events
      });
    }
    console.log(items);
    return items;
  }

  mockDays() {
    const n = 60;
    const days = [];
    let date = new Date(2020, 11, 20);
    const justDate = d => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
    const decDate = d => justDate(new Date(new Date(d).setDate(d.getDate() - 1)));
    for (let i = 0; i < n; i++) {
      const rows = this.items.map(item => {
        let result = {
          event: null
        };
        if (+item.start === +date) {
          result.event = 'start';
        } else if (+item.end === +date) {
          result.event = 'end';
        } else {
          const events = item.events.filter(e => +e.date === +date);
          if (events.length > 0) {
            result.event = events[0].type;
          } else if (+item.start < +date && +date < +item.end) {
            result.event = 'cont';
            const prevEvents = item.events.filter(e => +e.date < +date);
            if (prevEvents.length > 0) {
              result.previousEvent = prevEvents[prevEvents.length - 1];
            } else {
              result.previousEvent = 'start';
            }
          }
        }
        return result;
      });
      days.push({
        date,
        rows
      });
      date = decDate(date);
    }
    console.log(days);
    return days;
  }

  dow(date) {
    const values = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return values[date.getDay()];
  }

  month(date) {
    const values = [
      'JAN',
      'FEB',
      'MAR',
      'APR',
      'MAY',
      'JUN',
      'JUL',
      'AUG',
      'SEP',
      'OCT',
      'NOV',
      'DEC'
    ];
    return values[date.getMonth()];
  }

  day(date) {
    let result = date.getDate() + '';
    if (result < 10) result = '0' + result;
    return result;
  }

  scrollHorizontally(e) {
    const delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail));
    this.containerRef.scrollLeft -= delta * 40;
    e.preventDefault();
  }

  componentDidMount() {
    if (this.containerRef) {
      this.containerRef.addEventListener('mousewheel', e => this.scrollHorizontally(e), false);
      this.containerRef.addEventListener('DOMMouseScroll', e => this.scrollHorizontally(e), false);
    }
  }

  render() {
    return (
      <div className={styles.chartContainer}>
        <div className="header" />
        <div className="timeline" ref={this.setContainerRef}>
          {this.days.map(day => {
            return (
              <div className="tl-column" key={+day.date}>
                <div className="tl-date">
                  <p className="tl-dow">{this.dow(day.date)}</p>
                  <p className="tl-month">{this.month(day.date)}</p>
                  <p className="tl-day">{this.day(day.date)}</p>
                </div>
                {day.rows.map((row, i) => {
                  return (
                    <div className="tl-row" key={i}>
                      {row.event && (
                        <div className={cx('tl-bar', 'tl-' + row.event)}>
                          {row.event !== 'cont' && <div className="tl-button" />}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
          {/*<div className="tl-column">
            <div className="tl-date">
              <p className="tl-dow">FRI</p>
              <p className="tl-month">OCT</p>
              <p className="tl-day">09</p>
            </div>
            <div className="tl-row">
              <div className="tl-bar tl-end">
                <div className="tl-button" />
              </div>
            </div>
            <div className="tl-row" />
          </div>
          <div className="tl-column">
            <div className="tl-date">
              <p className="tl-dow">THU</p>
              <p className="tl-month">OCT</p>
              <p className="tl-day">08</p>
            </div>
            <div className="tl-row">
              <div className="tl-bar" />
            </div>
            <div className="tl-row" />
          </div>
          <div className="tl-column">
            <div className="tl-date">
              <p className="tl-dow">WED</p>
              <p className="tl-month">OCT</p>
              <p className="tl-day">07</p>
            </div>
            <div className="tl-row">
              <div className="tl-bar" />
            </div>
            <div className="tl-row" />
          </div>
          <div className="tl-column">
            <div className="tl-date">
              <p className="tl-dow">TUE</p>
              <p className="tl-month">OCT</p>
              <p className="tl-day">06</p>
            </div>
            <div className="tl-row">
              <div className="tl-bar" />
            </div>
            <div className="tl-row" />
          </div>
          <div className="tl-column">
            <div className="tl-date">
              <p className="tl-dow">MON</p>
              <p className="tl-month">OCT</p>
              <p className="tl-day">05</p>
            </div>
            <div className="tl-row">
              <div className="tl-bar" />
            </div>
            <div className="tl-row" />
          </div>
          <div className="tl-column">
            <div className="tl-date">
              <p className="tl-dow">SUN</p>
              <p className="tl-month">OCT</p>
              <p className="tl-day">04</p>
            </div>
            <div className="tl-row">
              <div className="tl-bar" />
            </div>
            <div className="tl-row" />
          </div>
          <div className="tl-column">
            <div className="tl-date">
              <p className="tl-dow">SAT</p>
              <p className="tl-month">OCT</p>
              <p className="tl-day">03</p>
            </div>
            <div className="tl-row">
              <div className="tl-bar" />
            </div>
            <div className="tl-row" />
          </div>
          <div className="tl-column">
            <div className="tl-date">
              <p className="tl-dow">FRI</p>
              <p className="tl-month">OCT</p>
              <p className="tl-day">02</p>
            </div>
            <div className="tl-row">
              <div className="tl-bar" />
            </div>
            <div className="tl-row" />
          </div>
          <div className="tl-column">
            <div className="tl-date">
              <p className="tl-dow">THU</p>
              <p className="tl-month">OCT</p>
              <p className="tl-day">01</p>
            </div>
            <div className="tl-row">
              <div className="tl-bar" />
            </div>
            <div className="tl-row" />
          </div>
          <div className="tl-column">
            <div className="tl-date">
              <p className="tl-dow">WED</p>
              <p className="tl-month">SEP</p>
              <p className="tl-day">30</p>
            </div>
            <div className="tl-row">
              <div className="tl-bar" />
            </div>
            <div className="tl-row" />
          </div>
          <div className="tl-column">
            <div className="tl-date">
              <p className="tl-dow">TUE</p>
              <p className="tl-month">SEP</p>
              <p className="tl-day">29</p>
            </div>
            <div className="tl-row">
              <div className="tl-bar" />
            </div>
            <div className="tl-row" />
          </div>
          <div className="tl-column">
            <div className="tl-date">
              <p className="tl-dow">MON</p>
              <p className="tl-month">SEP</p>
              <p className="tl-day">28</p>
            </div>
            <div className="tl-row">
              <div className="tl-bar" />
            </div>
            <div className="tl-row" />
          </div>
          <div className="tl-column">
            <div className="tl-date">
              <p className="tl-dow">SUN</p>
              <p className="tl-month">SEP</p>
              <p className="tl-day">27</p>
            </div>
            <div className="tl-row">
              <div className="tl-bar" />
            </div>
            <div className="tl-row" />
          </div>
          <div className="tl-column">
            <div className="tl-date">
              <p className="tl-dow">SAT</p>
              <p className="tl-month">SEP</p>
              <p className="tl-day">26</p>
            </div>
            <div className="tl-row">
              <div className="tl-bar" />
            </div>
            <div className="tl-row" />
          </div>
          <div className="tl-column">
            <div className="tl-date">
              <p className="tl-dow">FRI</p>
              <p className="tl-month">SEP</p>
              <p className="tl-day">25</p>
            </div>
            <div className="tl-row">
              <div className="tl-bar" />
            </div>
            <div className="tl-row" />
          </div>
          <div className="tl-column">
            <div className="tl-date">
              <p className="tl-dow">THU</p>
              <p className="tl-month">SEP</p>
              <p className="tl-day">24</p>
            </div>
            <div className="tl-row">
              <div className="tl-bar" />
            </div>
            <div className="tl-row" />
          </div>
          <div className="tl-column">
            <div className="tl-date">
              <p className="tl-dow">WED</p>
              <p className="tl-month">SEP</p>
              <p className="tl-day">23</p>
            </div>
            <div className="tl-row">
              <div className="tl-bar" />
            </div>
            <div className="tl-row" />
          </div>
          <div className="tl-column">
            <div className="tl-date">
              <p className="tl-dow">TUE</p>
              <p className="tl-month">SEP</p>
              <p className="tl-day">22</p>
            </div>
            <div className="tl-row">
              <div className="tl-bar" />
            </div>
            <div className="tl-row" />
          </div>
          <div className="tl-column">
            <div className="tl-date">
              <p className="tl-dow">MON</p>
              <p className="tl-month">SEP</p>
              <p className="tl-day">21</p>
            </div>
            <div className="tl-row">
              <div className="tl-bar" />
            </div>
            <div className="tl-row" />
          </div>
          <div className="tl-column">
            <div className="tl-date">
              <p className="tl-dow">SUN</p>
              <p className="tl-month">SEP</p>
              <p className="tl-day">20</p>
            </div>
            <div className="tl-row">
              <div className="tl-bar" />
            </div>
            <div className="tl-row" />
          </div>
          <div className="tl-column">
            <div className="tl-date">
              <p className="tl-dow">SAT</p>
              <p className="tl-month">SEP</p>
              <p className="tl-day">19</p>
            </div>
            <div className="tl-row">
              <div className="tl-bar">
                <div className="tl-button" />
              </div>
            </div>
            <div className="tl-row" />
          </div>
          <div className="tl-column">
            <div className="tl-date">
              <p className="tl-dow">FRI</p>
              <p className="tl-month">SEP</p>
              <p className="tl-day">18</p>
            </div>
            <div className="tl-row">
              <div className="tl-bar" />
            </div>
            <div className="tl-row" />
          </div>
          <div className="tl-column">
            <div className="tl-date">
              <p className="tl-dow">THU</p>
              <p className="tl-month">SEP</p>
              <p className="tl-day">17</p>
            </div>
            <div className="tl-row">
              <div className="tl-bar" />
            </div>
            <div className="tl-row" />
          </div>
          <div className="tl-column">
            <div className="tl-date">
              <p className="tl-dow">WED</p>
              <p className="tl-month">SEP</p>
              <p className="tl-day">16</p>
            </div>
            <div className="tl-row">
              <div className="tl-bar" />
            </div>
            <div className="tl-row" />
          </div>
          <div className="tl-column">
            <div className="tl-date">
              <p className="tl-dow">TUE</p>
              <p className="tl-month">SEP</p>
              <p className="tl-day">15</p>
            </div>
            <div className="tl-row">
              <div className="tl-bar" />
            </div>
            <div className="tl-row" />
          </div>
          <div className="tl-column">
            <div className="tl-date">
              <p className="tl-dow">MON</p>
              <p className="tl-month">SEP</p>
              <p className="tl-day">14</p>
            </div>
            <div className="tl-row">
              <div className="tl-bar" />
            </div>
            <div className="tl-row" />
          </div>
          <div className="tl-column">
            <div className="tl-date">
              <p className="tl-dow">SUN</p>
              <p className="tl-month">SEP</p>
              <p className="tl-day">13</p>
            </div>
            <div className="tl-row">
              <div className="tl-bar" />
            </div>
            <div className="tl-row" />
          </div>
          <div className="tl-column">
            <div className="tl-date">
              <p className="tl-dow">SAT</p>
              <p className="tl-month">SEP</p>
              <p className="tl-day">12</p>
            </div>
            <div className="tl-row">
              <div className="tl-bar" />
            </div>
            <div className="tl-row" />
          </div>
          <div className="tl-column">
            <div className="tl-date">
              <p className="tl-dow">FRI</p>
              <p className="tl-month">SEP</p>
              <p className="tl-day">11</p>
            </div>
            <div className="tl-row">
              <div className="tl-bar" />
            </div>
            <div className="tl-row" />
          </div>
          <div className="tl-column">
            <div className="tl-date">
              <p className="tl-dow">THU</p>
              <p className="tl-month">SEP</p>
              <p className="tl-day">10</p>
            </div>
            <div className="tl-row">
              <div className="tl-bar" />
            </div>
            <div className="tl-row" />
          </div>
          <div className="tl-column">
            <div className="tl-date">
              <p className="tl-dow">WED</p>
              <p className="tl-month">SEP</p>
              <p className="tl-day">09</p>
            </div>
            <div className="tl-row">
              <div className="tl-bar" />
            </div>
            <div className="tl-row" />
          </div>
          <div className="tl-column">
            <div className="tl-date">
              <p className="tl-dow">TUE</p>
              <p className="tl-month">SEP</p>
              <p className="tl-day">08</p>
            </div>
            <div className="tl-row">
              <div className="tl-bar" />
            </div>
            <div className="tl-row" />
          </div>
          <div className="tl-column">
            <div className="tl-date">
              <p className="tl-dow">MON</p>
              <p className="tl-month">SEP</p>
              <p className="tl-day">07</p>
            </div>
            <div className="tl-row">
              <div className="tl-bar" />
            </div>
            <div className="tl-row" />
          </div>
          <div className="tl-column">
            <div className="tl-date">
              <p className="tl-dow">SUN</p>
              <p className="tl-month">SEP</p>
              <p className="tl-day">06</p>
            </div>
            <div className="tl-row">
              <div className="tl-bar" />
            </div>
            <div className="tl-row" />
          </div>
          <div className="tl-column">
            <div className="tl-date">
              <p className="tl-dow">SAT</p>
              <p className="tl-month">SEP</p>
              <p className="tl-day">05</p>
            </div>
            <div className="tl-row">
              <div className="tl-bar" />
            </div>
            <div className="tl-row" />
          </div>
          <div className="tl-column">
            <div className="tl-date">
              <p className="tl-dow">FRI</p>
              <p className="tl-month">SEP</p>
              <p className="tl-day">04</p>
            </div>
            <div className="tl-row">
              <div className="tl-bar" />
            </div>
            <div className="tl-row" />
          </div>
          <div className="tl-column">
            <div className="tl-date">
              <p className="tl-dow">THU</p>
              <p className="tl-month">SEP</p>
              <p className="tl-day">03</p>
            </div>
            <div className="tl-row">
              <div className="tl-bar" />
            </div>
            <div className="tl-row" />
          </div>
          <div className="tl-column">
            <div className="tl-date">
              <p className="tl-dow">WED</p>
              <p className="tl-month">SEP</p>
              <p className="tl-day">02</p>
            </div>
            <div className="tl-row">
              <div className="tl-bar" />
            </div>
            <div className="tl-row" />
          </div>
          <div className="tl-column">
            <div className="tl-date">
              <p className="tl-dow">TUE</p>
              <p className="tl-month">SEP</p>
              <p className="tl-day">01</p>
            </div>
            <div className="tl-row">
              <div className="tl-bar" />
            </div>
            <div className="tl-row" />
          </div>
          <div className="tl-column">
            <div className="tl-date">
              <p className="tl-dow">MON</p>
              <p className="tl-month">AUG</p>
              <p className="tl-day">31</p>
            </div>
            <div className="tl-row">
              <div className="tl-bar tl-start">
                <div className="tl-button" />
              </div>
            </div>
            <div className="tl-row" />
          </div>*/}
        </div>
      </div>
    );
  }
}
