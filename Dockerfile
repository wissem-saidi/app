# Use a specific version of the official WildFly image as a base
FROM jboss/wildfly:latest

# Copy your app WAR into the WildFly deployment directory as ROOT.war
COPY app.war /opt/jboss/wildfly/standalone/deployments/ROOT.war

# Expose the necessary ports
EXPOSE 8080 8443 9990

# Command to run WildFly
CMD ["/opt/jboss/wildfly/bin/standalone.sh", "-b", "0.0.0.0"]

