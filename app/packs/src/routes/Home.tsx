import React, { FC, useEffect, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import consumer from "../channels/consumer"
import styled from 'styled-components';
import dayjs from 'dayjs';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

import { apiFetchRequested,apiFetchSucceeded } from 'store/actions';
import { State,DataPoint } from 'store/reducers';

// Used styled components for styling the component (most easiet way)
const StyledContainer = styled.div`
    display: flex;
    flex-direction: column;
`;

const StyledTopBar = styled.div`
    flex:1;
    background-color:#f0f0f0;
    border-radius:4px;
    margin:5px;
    padding:5px;
    text-align:center;
`

const StyledBoxContainer = styled.div`
    flex:2;
    display: flex;
    flex-wrap: wrap;
`

const StyledBox = styled.div`
    flex:1;
    background-color:#f0f0f0;
    border-radius:4px;
    margin:5px;
    padding:5px;
`;

const StyledLabel = styled.div`
    color:#787878;
    padding:5px;
`;

const StyledType = styled.div`
    color:#787878;
    padding:3px;
    font-size:12px
`;

const Home: FC = () => {
  const dispatch = useDispatch();
  const channels = useSelector((state: State) => state.channels);
  const dataPoints = useSelector((state: State) => state.dataPoints);
  const devices = useSelector((state: State) => state.devices);

  useEffect(() => {
    dispatch(apiFetchRequested('devices'));
    dispatch(apiFetchRequested('channels'));

    // Need to improve/limit the number of data fetched the initial payload is too much and charts tends to slowdown
    // filtering data for 30mins would be ideal for this 
    // dispatch(apiFetchRequested('data_points'));


    // Added the websocket subscription in useEffect
    consumer.subscriptions.create(
      { channel: 'DownstreamChannel' },
      {
        received(data: DataPoint) {
          dispatch(apiFetchSucceeded('dataPoints', [data]));
        },
      }
    );

    return ()=>{      
      // call websocket disconnect in component unmount
      consumer.disconnect();
    }
  }, []);

  
  // custom function for making X and Y axis more meaningful
  const formatXAxis = (date:Date) => dayjs(date).format('HH:mm:ss')
  const formatYAxis = (name:string) => name.charAt(0).toUpperCase() + name.slice(1);


  /**
   * Wrapped the Chart component with a memo for performance optimization
   */
  const DataChart =  memo(({channel,dataPoints}:{channel:any,dataPoints:any}) =>      
    <LineChart
      data={_.values(_.filter(dataPoints, { channelId: channel.id }))}
      height={200}
      width={250}
    >
      <Line dataKey="value" isAnimationActive={false} dot={false} type='monotone' strokeWidth={1}/>
      <CartesianGrid strokeDasharray="3 3"/>
      <XAxis dataKey="createdAt" tickFormatter={formatXAxis}/>
      <YAxis  unit={channel.unit} />
    </LineChart>
);

  return (
    <StyledContainer>
      <StyledTopBar>Device Dashboard {dayjs().format('YYYY-MM-HH')}</StyledTopBar>
      <StyledBoxContainer>
        {_.flatMap(devices, (device) =>
          _.map(_.filter(channels, { deviceId: device.id }), (channel) => (
            <StyledBox key={`device-${device.id}-channel-${channel.id}`}>
              <StyledLabel>{device.name}</StyledLabel>
              <StyledType>{formatYAxis(channel.name)}</StyledType>
                  <DataChart 
                    dataPoints={dataPoints}
                    channel={channel}
                  />
           </StyledBox>
          ))
        )}
      </StyledBoxContainer>
    </StyledContainer>
  );
};

export default Home;
