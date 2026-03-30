declare module 'react-native-map-clustering' {
  import MapView, { MapViewProps } from 'react-native-maps';
  import React from 'react';

  export interface ClusterMapProps extends MapViewProps {
    radius?: number;
    maxZoom?: number;
    minZoom?: number;
    minPoints?: number;
    extent?: number;
    nodeSize?: number;
    clusterColor?: string;
    clusterTextColor?: string;
    clusterFontFamily?: string | undefined;
    animationEnabled?: boolean;
    clusteringEnabled?: boolean;
    preserveClusterPressBehavior?: boolean;
    renderCluster?: (cluster: any) => React.ReactElement;
    onClusterPress?: (cluster: any, markers: any[]) => void;
    /** Callback that receives the underlying MapView ref — required by this library */
    mapRef?: (ref: any) => void;
    children?: React.ReactNode;
  }

  const ClusterMap: React.ForwardRefExoticComponent<ClusterMapProps & React.RefAttributes<MapView>>;
  export default ClusterMap;
}
