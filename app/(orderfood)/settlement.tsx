import { StyleSheet, Text, View } from 'react-native';
import { Card } from 'react-native-paper';

export default function SettlementScreen() {
  return (
    <View style={styles.container}>
      <Text>结算页面</Text>
      <Card>
        <Card.Content>
          <Text>订单信息</Text>
        </Card.Content>
      </Card>

      <Card>
        <Card.Content>
          <Text>订单信息</Text>
        </Card.Content>
      </Card>

      <Card>
        <Card.Content>
          <Text>小计</Text>
        </Card.Content>
      </Card>

      <Card>
        <Card.Content>
          <Text>备注</Text>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
